import { inject, injectable } from "tsyringe";
import type { NotificacionFilters } from "../../domain/repository/NotificacionFilters";
import type { NotificacionRepository } from "../../domain/repository/NotificacionRepository";
import type { ListarNotificacionesOutputDto } from "../dtos/NotificacionDto";
import type { NotificacionMapper } from "../mappers/NotificacionMapper";

@injectable()
export class ListarNotificacionesUseCase {
	constructor(
		@inject("NotificacionRepository")
		private readonly repository: NotificacionRepository,
		@inject("NotificacionMapper")
		private readonly mapper: NotificacionMapper,
	) {}

	public async run(
		filters: NotificacionFilters,
	): Promise<ListarNotificacionesOutputDto> {
		const [paginado, noLeidas] = await Promise.all([
			this.repository.findByUsuario(filters),
			this.repository.countNoLeidas(filters.usuarioId),
		]);

		return {
			data: paginado.data.map((n) => this.mapper.toDto(n)),
			page: paginado.page,
			totalItems: paginado.totalItems,
			totalPages: paginado.totalPages,
			noLeidas,
		};
	}
}
