import { inject, injectable } from "tsyringe";
import { assertPuedeAcceder } from "@/core/shared/domain/Actor";
import { InsumoNotFoundError } from "../../domain/error/InsumoNotFoundError";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";
import type { InsumoOutputDto } from "../dtos/InsumoDto";
import type { InsumoMapper } from "../mappers/InsumoMapper";

@injectable()
export class ObtenerDetalleInsumoUseCase {
	constructor(
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("InsumoMapper")
		private readonly mapper: InsumoMapper,
	) {}

	public async run(
		id: number,
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
			"No tienes permiso para acceder a este insumo",
		);
		return this.mapper.toDto(insumo);
	}
}
