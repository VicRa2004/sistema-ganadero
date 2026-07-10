import { inject, injectable } from "tsyringe";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { RanchoFilters } from "../../domain/repository/RanchoFilters";
import type { RanchoRepository } from "../../domain/repository/RanchoRepository";
import type { RanchoOutputDto } from "../dtos/RanchoDto";
import type { RanchoMapper } from "../mappers/RanchoMapper";

@injectable()
export class ListarRanchosUseCase {
	constructor(
		@inject("RanchoRepository")
		private readonly ranchoRepository: RanchoRepository,
		@inject("RanchoMapper")
		private readonly mapper: RanchoMapper,
	) {}

	public async run(
		filters: RanchoFilters,
	): Promise<Pagination<RanchoOutputDto>> {
		const pagination = await this.ranchoRepository.findAll(filters);
		return {
			data: pagination.data.map((r) => this.mapper.toDto(r)),
			page: pagination.page,
			totalItems: pagination.totalItems,
			totalPages: pagination.totalPages,
		};
	}
}
