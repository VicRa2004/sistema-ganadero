import { inject, injectable } from "tsyringe";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { NotificacionRepository } from "../../domain/repository/NotificacionRepository";
import type { NotificacionOutputDto } from "../dtos/NotificacionDto";
import type { NotificacionMapper } from "../mappers/NotificacionMapper";

export class NotificacionNotFoundError extends BaseError {
	constructor(id: number) {
		super(`Notificación con ID ${id} no fue encontrada`, 404);
	}
}

@injectable()
export class MarcarNotificacionLeidaUseCase {
	constructor(
		@inject("NotificacionRepository")
		private readonly repository: NotificacionRepository,
		@inject("NotificacionMapper")
		private readonly mapper: NotificacionMapper,
	) {}

	public async run(
		id: number,
		usuarioId: number,
	): Promise<NotificacionOutputDto> {
		const actualizada = await this.repository.marcarLeida(id, usuarioId);
		if (!actualizada) {
			throw new NotificacionNotFoundError(id);
		}
		return this.mapper.toDto(actualizada);
	}
}
