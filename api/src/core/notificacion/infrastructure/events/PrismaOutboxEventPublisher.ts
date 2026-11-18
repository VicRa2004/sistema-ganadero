import { inject, injectable } from "tsyringe";
import { db } from "@/core/config/transaction";
import { logger } from "@/core/config/logger";
import type { DomainEvent } from "@/core/shared/domain/events/DomainEvent";
import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { Prisma } from "@/generated/prisma/client";
import type { NotificacionEventSubscriber } from "../../application/subscribers/NotificacionEventSubscriber";
import type {
	AlertaNotificacionDomainEvent,
	AlertaNotificacionPayload,
	OutboxEventPublisher,
} from "../../domain/events/SaludEvents";

@injectable()
export class PrismaOutboxEventPublisher implements OutboxEventPublisher {
	constructor(
		@inject("EventBus")
		private readonly eventBus: EventBus,
		@inject("NotificacionEventSubscriber")
		private readonly subscriber: NotificacionEventSubscriber,
	) {
		this.subscriber.register();
	}

	public async publish(event: DomainEvent): Promise<void> {
		const outbox = await db().eventoOutbox.create({
			data: {
				eventName: event.eventName,
				payload: event.data as Prisma.InputJsonValue,
			},
		});

		try {
			await this.dispatchOutboxRecord(outbox.id, event.eventName, event.data);
		} catch (error) {
			logger.error(
				`Error al despachar evento outbox #${outbox.id} (${event.eventName})`,
				error,
			);
		}
	}

	public async reprocesarPendientes(): Promise<number> {
		const pendientes = await db().eventoOutbox.findMany({
			where: { procesadoAt: null, intentos: { lt: 5 } },
			orderBy: { createdAt: "asc" },
			take: 100,
		});

		let procesados = 0;
		for (const item of pendientes) {
			try {
				await this.dispatchOutboxRecord(item.id, item.eventName, item.payload);
				procesados++;
			} catch (error) {
				logger.error(`Reintento outbox #${item.id} fallido`, error);
			}
		}
		return procesados;
	}

	private async dispatchOutboxRecord(
		outboxId: number,
		eventName: string,
		data: unknown,
	): Promise<void> {
		try {
			// Emitir en EventBus y ejecutar manejo directo del suscriptor para asegurar consistencia
			this.eventBus.publish({
				eventName,
				occurredOn: new Date(),
				data,
			});

			if (
				eventName === "insumo.bajo-stock" ||
				eventName === "insumo.por-caducar" ||
				eventName === "tratamiento.por-vencer" ||
				eventName === "sesion.programada" ||
				eventName === "ganado.vacuna-pendiente" ||
				eventName === "reproduccion.parto-proximo"
			) {
				await this.subscriber.handle({
					eventName,
					occurredOn: new Date(),
					data: data as AlertaNotificacionPayload,
				} as AlertaNotificacionDomainEvent);
			}

			await db().eventoOutbox.update({
				where: { id: outboxId },
				data: {
					procesadoAt: new Date(),
					intentos: { increment: 1 },
					error: null,
				},
			});
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			await db().eventoOutbox.update({
				where: { id: outboxId },
				data: {
					intentos: { increment: 1 },
					error: msg,
				},
			});
			throw error;
		}
	}
}
