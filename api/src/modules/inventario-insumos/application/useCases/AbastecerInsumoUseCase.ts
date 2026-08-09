import { inject, injectable } from "tsyringe";
import { BaseError } from "@/core/shared/domain/error/BaseError";
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

		if (rol !== "ADMIN" && insumo.getUsuarioId() !== usuarioId) {
			throw new BaseError("No tienes permiso para abastecer este insumo", 403);
		}

		insumo.adicionarStock(dto.cantidad);
		const saved = await this.insumoRepository.save(insumo);
		return this.mapper.toDto(saved);
	}
}
