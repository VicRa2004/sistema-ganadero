import { inject, injectable } from "tsyringe";
import { InsumoNotFoundError } from "../../domain/error/InsumoNotFoundError";
import { BaseError } from "@/core/shared/domain/error/BaseError";
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

		if (rol !== "ADMIN" && insumo.getUsuarioId() !== usuarioId) {
			throw new BaseError("No tienes permiso para modificar este insumo", 403);
		}

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
