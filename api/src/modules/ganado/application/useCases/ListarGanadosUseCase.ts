import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { GanadoFilters } from "../../domain/repository/GanadoFilters";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";
import type { GanadoOutputDto } from "../dtos/GanadoDto";
import type { GanadoMapper } from "../mappers/GanadoMapper";

@injectable()
export class ListarGanadosUseCase {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("GanadoMapper")
		private readonly mapper: GanadoMapper,
	) {}

	public async run(
		filters: GanadoFilters,
		actor: Actor,
	): Promise<Pagination<GanadoOutputDto>> {
		const pagination = await this.ganadoRepository.findAll({
			...filters,
			usuarioId: usuarioIdDeFiltro(actor),
		});
		return {
			data: pagination.data.map((g) => this.mapper.toDto(g)),
			page: pagination.page,
			totalItems: pagination.totalItems,
			totalPages: pagination.totalPages,
		};
	}
}
