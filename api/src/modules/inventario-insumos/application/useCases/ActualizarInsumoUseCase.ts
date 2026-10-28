import { inject, injectable } from "tsyringe";
import { assertPuedeAcceder } from "@/core/shared/domain/Actor";
import { InsumoNotFoundError } from "../../domain/error/InsumoNotFoundError";
import type { TipoInsumo } from "../../domain/TipoInsumo";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";
import type {
	ActualizarInsumoInputDto,
	InsumoOutputDto,
} from "../dtos/InsumoDto";
import type { InsumoMapper } from "../mappers/InsumoMapper";

@injectable()
export class ActualizarInsumoUseCase {
	constructor(
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("InsumoMapper")
		private readonly mapper: InsumoMapper,
	) {}

	public async run(
		id: number,
		dto: ActualizarInsumoInputDto,
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
			"No tienes permiso para modificar este insumo",
		);

		insumo.actualizarDatos(
			dto.nombre ?? insumo.getNombre(),
			(dto.tipo as TipoInsumo) ?? insumo.getTipo(),
			dto.stockMinimo ?? insumo.getStockMinimo(),
			dto.unidadMedida ?? insumo.getUnidadMedida(),
			dto.lote ?? insumo.getLote(),
			dto.fechaCaducidad
				? new Date(dto.fechaCaducidad)
				: insumo.getFechaCaducidad(),
		);

		const saved = await this.insumoRepository.save(insumo);
		return this.mapper.toDto(saved);
	}
}
