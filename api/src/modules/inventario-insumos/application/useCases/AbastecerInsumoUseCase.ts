import { inject, injectable } from "tsyringe";
import { assertPuedeAcceder } from "@/core/shared/domain/Actor";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import { InsumoNotFoundError } from "../../domain/error/InsumoNotFoundError";
import { MovimientoInsumo } from "../../domain/MovimientoInsumo";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";
import type { MovimientoInsumoRepository } from "../../domain/repository/MovimientoInsumoRepository";
import type {
	AbastecerInsumoInputDto,
	InsumoOutputDto,
} from "../dtos/InsumoDto";
import type { InsumoMapper } from "../mappers/InsumoMapper";

@injectable()
export class AbastecerInsumoUseCase {
	constructor(
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("InsumoMapper")
		private readonly mapper: InsumoMapper,
		@inject("MovimientoInsumoRepository")
		private readonly movimientoRepository?: MovimientoInsumoRepository,
		@inject("TransactionRunner")
		private readonly transactionRunner?: TransactionRunner,
	) {}

	public async run(
		id: number,
		dto: AbastecerInsumoInputDto,
		usuarioId: number,
		rol: string,
	): Promise<InsumoOutputDto> {
		const insumo = await this.insumoRepository.findById(id);
		if (!insumo) {
			throw new InsumoNotFoundError(id);
		}

		assertPuedeAcceder(
			{ id: usuarioId, role: rol },
			insumo.getUsuarioId(),
			"No tienes permiso para abastecer este insumo",
		);

		insumo.validarAdicion(dto.cantidad);

		const runTx = this.transactionRunner
			? this.transactionRunner.run.bind(this.transactionRunner)
			: <T>(fn: () => Promise<T>) => fn();

		const saved = await runTx(async () => {
			let updated = await this.insumoRepository.adicionarStock(
				id,
				dto.cantidad,
			);
			if (!updated) {
				throw new InsumoNotFoundError(id);
			}

			if (
				dto.costoUnitario !== undefined &&
				this.insumoRepository.actualizarCostoUnitario
			) {
				const stockPrevio = Math.max(0, updated.getStock() - dto.cantidad);
				const costoPrevio = updated.getCostoUnitario();
				const nuevoCosto =
					stockPrevio > 0 && costoPrevio > 0
						? Number(
								(
									(stockPrevio * costoPrevio +
										dto.cantidad * dto.costoUnitario) /
									updated.getStock()
								).toFixed(2),
							)
						: Number(dto.costoUnitario.toFixed(2));
				const withCost = await this.insumoRepository.actualizarCostoUnitario(
					id,
					nuevoCosto,
				);
				if (withCost) {
					updated = withCost;
				}
			}

			if (this.movimientoRepository) {
				await this.movimientoRepository.registrar(
					MovimientoInsumo.create({
						insumoId: id,
						tipo: "ENTRADA",
						cantidad: dto.cantidad,
						costoUnitario: dto.costoUnitario ?? updated.getCostoUnitario(),
						motivo: dto.motivo?.trim() || "Abastecimiento de inventario",
						referenciaTipo: "ABASTECIMIENTO",
						usuarioId,
					}),
				);
			}

			return updated;
		});

		return this.mapper.toDto(saved);
	}
}
