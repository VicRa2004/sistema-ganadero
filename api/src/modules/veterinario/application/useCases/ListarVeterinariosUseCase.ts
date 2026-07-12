import { inject, injectable } from "tsyringe";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { VeterinarioRepository } from "../../domain/repository/VeterinarioRepository";
import type { VeterinarioFilters } from "../../domain/repository/VeterinarioFilters";
import type { VeterinarioOutputDto } from "../dtos/VeterinarioDto";
import type { VeterinarioMapper } from "../mappers/VeterinarioMapper";

@injectable()
export class ListarVeterinariosUseCase {
	constructor(
		@inject("VeterinarioRepository")
		private readonly repository: VeterinarioRepository,
		@inject("VeterinarioMapper")
		private readonly mapper: VeterinarioMapper,
	) {}

	public async run(
		filters: VeterinarioFilters,
	): Promise<Pagination<VeterinarioOutputDto>> {
		const pagination = await this.repository.findAll(filters);

		return {
			data: pagination.data.map((v) => this.mapper.toDto(v)),
			page: pagination.page,
			totalItems: pagination.totalItems,
			totalPages: pagination.totalPages,
		};
	}
}
