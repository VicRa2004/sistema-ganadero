import { inject, injectable } from "tsyringe";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { SesionSanitariaFilters } from "../../domain/repository/SesionSanitariaFilters";
import type { SesionSanitariaRepository } from "../../domain/repository/SesionSanitariaRepository";
import type { SesionSanitariaOutputDto } from "../dtos/SesionSanitariaDto";
import type { SesionSanitariaMapper } from "../mappers/SesionSanitariaMapper";

@injectable()
export class ListarSesionesSanitariasUseCase {
	constructor(
		@inject("SesionSanitariaRepository")
		private readonly sesionSanitariaRepository: SesionSanitariaRepository,
		@inject("SesionSanitariaMapper")
		private readonly mapper: SesionSanitariaMapper,
	) {}

	public async run(
		filters: SesionSanitariaFilters,
	): Promise<Pagination<SesionSanitariaOutputDto>> {
		const result = await this.sesionSanitariaRepository.find(filters);

		const dtos = result.data.map((sesion) => this.mapper.toDto(sesion));

		return {
			data: dtos,
			page: result.page,
			totalItems: result.totalItems,
			totalPages: result.totalPages,
		};
	}
}
