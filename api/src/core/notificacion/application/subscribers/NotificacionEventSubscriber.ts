import { inject, injectable } from "tsyringe";
import type { EventBus } from "@/core/shared/domain/events/EventBus";
import { logger } from "@/core/config/logger";
import type { AlertaNotificacionDomainEvent } from "../../domain/events/SaludEvents";
import { Notificacion } from "../../domain/Notificacion";
import type { NotificacionRepository } from "../../domain/repository/NotificacionRepository";

const EVENTOS_SALUD = [
	"insumo.bajo-stock",
	"insumo.por-caducar",
	"tratamiento.por-vencer",
	"sesion.programada",
	"ganado.vacuna-pendiente",
] as const;

@injectable()
export class NotificacionEventSubscriber {
	private registrado = false;

	constructor(
		@inject("EventBus")
		private readonly eventBus: EventBus,
		@inject("NotificacionRepository")
		private readonly repository: NotificacionRepository,
	) {}

	public register(): void {
		if (this.registrado) return;
		this.registrado = true;

		for (const eventName of EVENTOS_SALUD) {
			this.eventBus.subscribe<AlertaNotificacionDomainEvent>(
				eventName,
				(event) => {
					void this.handle(event).catch((err) => {
						logger.error(
							`Error procesando evento de notificación ${event.eventName}`,
							err,
						);
					});
				},
			);
		}
	}

	public async handle(event: AlertaNotificacionDomainEvent): Promise<boolean> {
		const payload = event.data;
		if (!payload?.usuarioId) return false;

		const preferencias = await this.repository.getPreferencias(
			payload.usuarioId,
		);
		const pref = preferencias.find((p) => p.tipo === payload.tipo);
		// Si el usuario desactivó explícitamente este tipo de alerta, no persistir notificación in-app
		if (pref && !pref.inApp) {
			return false;
		}

		const notificacion = Notificacion.create(
			payload.usuarioId,
			payload.tipo,
			payload.titulo,
			payload.cuerpo,
			payload.claveDeduplicacion,
			payload.referenciaTipo,
			payload.referenciaId,
		);

		const creada = await this.repository.saveIfNotExists(notificacion);
		return creada !== null;
	}
}
