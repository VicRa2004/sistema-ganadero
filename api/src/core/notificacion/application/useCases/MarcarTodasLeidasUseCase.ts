import { inject, injectable } from "tsyringe";
import type { NotificacionRepository } from "../../domain/repository/NotificacionRepository";

@injectable()
export class MarcarTodasLeidasUseCase {
	constructor(
		@inject("NotificacionRepository")
		private readonly repository: NotificacionRepository,
	) {}

	public async run(usuarioId: number): Promise<{ actualizadas: number }> {
		const actualizadas = await this.repository.marcarTodasLeidas(usuarioId);
		return { actualizadas };
	}
}
