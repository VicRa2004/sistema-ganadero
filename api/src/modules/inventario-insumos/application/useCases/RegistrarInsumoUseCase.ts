import { inject, injectable } from "tsyringe";
import type { TransactionRunner } from "@/core/shared/domain/services/TransactionRunner";
import { Insumo } from "../../domain/Insumo";
import { MovimientoInsumo } from "../../domain/MovimientoInsumo";
import type { TipoInsumo } from "../../domain/TipoInsumo";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";
import type { MovimientoInsumoRepository } from "../../domain/repository/MovimientoInsumoRepository";
import type {
	InsumoOutputDto,
	RegistrarInsumoInputDto,
} from "../dtos/InsumoDto";
import type { InsumoMapper } from "../mappers/InsumoMapper";

@injectable()
export class RegistrarInsumoUseCase {
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

	public async run(dto: RegistrarInsumoInputDto): Promise<InsumoOutputDto> {
		const insumo = Insumo.create(
			dto.nombre,
			dto.tipo as TipoInsumo,
			dto.stockInicial,
			dto.stockMinimo,
			dto.unidadMedida,
			dto.lote,
			new Date(dto.fechaCaducidad),
			dto.usuarioId,
			dto.periodoRetiroDias ?? 0,
			dto.costoUnitario ?? 0,
		);

		const runTx = this.transactionRunner
			? this.transactionRunner.run.bind(this.transactionRunner)
			: <T>(fn: () => Promise<T>) => fn();

		const saved = await runTx(async () => {
			const created = await this.insumoRepository.save(insumo);
			if (this.movimientoRepository && created.getStock() > 0) {
				await this.movimientoRepository.registrar(
					MovimientoInsumo.create({
						insumoId: created.getId(),
						tipo: "ENTRADA",
						cantidad: created.getStock(),
						costoUnitario: created.getCostoUnitario(),
						motivo: "Stock inicial al registrar insumo",
						referenciaTipo: "INICIAL",
						usuarioId: dto.usuarioId,
					}),
				);
			}
			return created;
		});

		return this.mapper.toDto(saved);
	}
}
