import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { PropietarioFilters } from "../../domain/repository/PropietarioFilters";
import type { PropietarioRepository } from "../../domain/repository/PropietarioRepository";
import type { PropietarioOutputDto } from "../dtos/PropietarioDto";
import type { PropietarioMapper } from "../mappers/PropietarioMapper";

@injectable()
export class ListarPropietariosUseCase {
	constructor(
		@inject("PropietarioRepository")
		private readonly propietarioRepository: PropietarioRepository,
		@inject("PropietarioMapper")
		private readonly mapper: PropietarioMapper,
	) {}

	public async run(
		filters: PropietarioFilters,
		actor: Actor,
	): Promise<Pagination<PropietarioOutputDto>> {
		const pagination = await this.propietarioRepository.findAll({
			...filters,
			usuarioId: usuarioIdDeFiltro(actor),
		});
		return {
			data: pagination.data.map((p) => this.mapper.toDto(p)),
			page: pagination.page,
			totalItems: pagination.totalItems,
			totalPages: pagination.totalPages,
		};
	}
}
