import { inject, injectable } from "tsyringe";
import { assertPuedeAcceder } from "@/core/shared/domain/Actor";
import { InsumoNotFoundError } from "../../domain/error/InsumoNotFoundError";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";
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

		// Suma atómica sobre el stock actual de la BD
		const saved = await this.insumoRepository.adicionarStock(id, dto.cantidad);
		if (!saved) {
			throw new InsumoNotFoundError(id);
		}
		return this.mapper.toDto(saved);
	}
}
