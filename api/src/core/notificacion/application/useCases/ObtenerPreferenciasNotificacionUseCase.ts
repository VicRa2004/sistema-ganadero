import { inject, injectable } from "tsyringe";
import type { NotificacionRepository } from "../../domain/repository/NotificacionRepository";
import { TIPOS_NOTIFICACION } from "../../domain/TipoNotificacion";
import type { PreferenciaNotificacionDto } from "../dtos/NotificacionDto";

@injectable()
export class ObtenerPreferenciasNotificacionUseCase {
	constructor(
		@inject("NotificacionRepository")
		private readonly repository: NotificacionRepository,
	) {}

	public async run(usuarioId: number): Promise<PreferenciaNotificacionDto[]> {
		const existentes = await this.repository.getPreferencias(usuarioId);
		const mapa = new Map(existentes.map((p) => [p.tipo, p]));

		return TIPOS_NOTIFICACION.map((tipo) => {
			const pref = mapa.get(tipo);
			return (
				pref ?? {
					tipo,
					inApp: true,
					email: false,
				}
			);
		});
	}
}
