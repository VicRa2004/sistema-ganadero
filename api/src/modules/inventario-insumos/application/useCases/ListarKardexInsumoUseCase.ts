import { inject, injectable } from "tsyringe";
import { type Actor, assertPuedeAcceder } from "@/core/shared/domain/Actor";
import { InsumoNotFoundError } from "../../domain/error/InsumoNotFoundError";
import type { TipoMovimientoInsumo } from "../../domain/MovimientoInsumo";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";
import type { MovimientoInsumoRepository } from "../../domain/repository/MovimientoInsumoRepository";
import type { KardexInsumoOutputDto } from "../dtos/InsumoDto";
import type { MovimientoInsumoMapper } from "../mappers/MovimientoInsumoMapper";

@injectable()
export class ListarKardexInsumoUseCase {
	constructor(
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("MovimientoInsumoRepository")
		private readonly movimientoRepository: MovimientoInsumoRepository,
		@inject("MovimientoInsumoMapper")
		private readonly mapper: MovimientoInsumoMapper,
	) {}

	public async run(
		insumoId: number,
		filters: {
			page: number;
			limit: number;
			tipo?: TipoMovimientoInsumo;
			desde?: Date;
			hasta?: Date;
		},
		actor: Actor,
	): Promise<KardexInsumoOutputDto> {
		const insumo = await this.insumoRepository.findById(insumoId);
		if (!insumo) {
			throw new InsumoNotFoundError(insumoId);
		}
		assertPuedeAcceder(
			actor,
			insumo.getUsuarioId(),
			"No tienes permiso para consultar el kardex de este insumo",
		);

		const [movimientos, sumaKardex] = await Promise.all([
			this.movimientoRepository.findByInsumo({
				insumoId,
				page: filters.page,
				limit: filters.limit,
				tipo: filters.tipo,
				desde: filters.desde,
				hasta: filters.hasta,
			}),
			this.movimientoRepository.sumDeltaByInsumo(insumoId),
		]);

		const stockActual = insumo.getStock();

		return {
			insumoId: insumo.getId(),
			insumoNombre: insumo.getNombre(),
			unidadMedida: insumo.getUnidadMedida(),
			stockActual,
			sumaKardex,
			consistente: Math.abs(stockActual - sumaKardex) < 0.001,
			movimientos: {
				...movimientos,
				data: movimientos.data.map((m) => this.mapper.toDto(m)),
			},
		};
	}
}
