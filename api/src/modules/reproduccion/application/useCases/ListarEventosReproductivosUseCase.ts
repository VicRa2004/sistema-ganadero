import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { EventoReproductivoFilters } from "../../domain/repository/EventoReproductivoFilters";
import type { EventoReproductivoRepository } from "../../domain/repository/EventoReproductivoRepository";
import type { EventoReproductivoOutputDto } from "../dtos/ReproduccionDto";
import type { EventoReproductivoMapper } from "../mappers/EventoReproductivoMapper";

@injectable()
export class ListarEventosReproductivosUseCase {
	constructor(
		@inject("EventoReproductivoRepository")
		private readonly repo: EventoReproductivoRepository,
		@inject("EventoReproductivoMapper")
		private readonly mapper: EventoReproductivoMapper,
	) {}

	public async run(
		filters: Omit<EventoReproductivoFilters, "actor">,
		actor: Actor,
	): Promise<Pagination<EventoReproductivoOutputDto>> {
		const res = await this.repo.findAll({
			...filters,
			actor,
		});
		return {
			data: res.data.map((e) => this.mapper.toDto(e)),
			page: res.page,
			totalItems: res.totalItems,
			totalPages: res.totalPages,
		};
	}
}
