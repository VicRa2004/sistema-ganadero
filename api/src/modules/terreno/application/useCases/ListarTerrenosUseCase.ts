import { inject, injectable } from "tsyringe";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { TerrenoFilters } from "../../domain/repository/TerrenoFilters";
import type { TerrenoRepository } from "../../domain/repository/TerrenoRepository";
import type { TerrenoOutputDto } from "../dtos/TerrenoDto";
import type { TerrenoMapper } from "../mappers/TerrenoMapper";

@injectable()
export class ListarTerrenosUseCase {
	constructor(
		@inject("TerrenoRepository")
		private readonly terrenoRepository: TerrenoRepository,
		@inject("TerrenoMapper")
		private readonly mapper: TerrenoMapper,
	) {}

	public async run(
		filters: TerrenoFilters,
	): Promise<Pagination<TerrenoOutputDto>> {
		const pagination = await this.terrenoRepository.findAll(filters);
		return {
			data: pagination.data.map((r) => this.mapper.toDto(r)),
			page: pagination.page,
			totalItems: pagination.totalItems,
			totalPages: pagination.totalPages,
		};
	}
}
