import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";
import type { TipoNotificacion } from "../TipoNotificacion";

export interface AlertaNotificacionPayload {
	usuarioId: number;
	tipo: TipoNotificacion;
	titulo: string;
	cuerpo: string;
	claveDeduplicacion: string;
	referenciaTipo: string | null;
	referenciaId: number | null;
}

export class AlertaNotificacionDomainEvent implements DomainEvent {
	public readonly occurredOn: Date;

	constructor(
		public readonly eventName:
			| "insumo.bajo-stock"
			| "insumo.por-caducar"
			| "tratamiento.por-vencer"
			| "sesion.programada"
			| "ganado.vacuna-pendiente"
			| "reproduccion.parto-proximo"
			| "alimentacion.autonomia-baja",
		public readonly data: AlertaNotificacionPayload,
	) {
		this.occurredOn = new Date();
	}
}

export interface OutboxEventPublisher {
	publish(event: DomainEvent): Promise<void>;
	reprocesarPendientes(): Promise<number>;
}
