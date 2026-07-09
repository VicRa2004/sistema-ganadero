import { inject, injectable } from "tsyringe";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { InsumoFilters } from "../../domain/repository/InsumoFilters";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";
import type { InsumoOutputDto } from "../dtos/InsumoDto";
import type { InsumoMapper } from "../mappers/InsumoMapper";

@injectable()
export class ListarInsumosUseCase {
	constructor(
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
		@inject("InsumoMapper")
		private readonly mapper: InsumoMapper,
	) {}

	public async run(
		filters: InsumoFilters,
	): Promise<Pagination<InsumoOutputDto>> {
		const result = await this.insumoRepository.findAll(filters);
		return {
			data: result.data.map((insumo) => this.mapper.toDto(insumo)),
			page: result.page,
			totalItems: result.totalItems,
			totalPages: result.totalPages,
		};
	}
}
