import { inject, injectable } from "tsyringe";
import type { NotificacionRepository } from "../../domain/repository/NotificacionRepository";
import type {
	ActualizarPreferenciaInputDto,
	PreferenciaNotificacionDto,
} from "../dtos/NotificacionDto";

@injectable()
export class ActualizarPreferenciasNotificacionUseCase {
	constructor(
		@inject("NotificacionRepository")
		private readonly repository: NotificacionRepository,
	) {}

	public async run(
		usuarioId: number,
		preferencias: ActualizarPreferenciaInputDto[],
	): Promise<PreferenciaNotificacionDto[]> {
		const resultados: PreferenciaNotificacionDto[] = [];
		for (const item of preferencias) {
			const guardada = await this.repository.upsertPreferencia(
				usuarioId,
				item.tipo,
				item.inApp,
				item.email ?? false,
			);
			resultados.push(guardada);
		}
		return resultados;
	}
}
