import { EventEmitter } from "events";
import type { EventBus } from "../../domain/events/EventBus";
import type { DomainEvent } from "../../domain/events/DomainEvent";
import { singleton } from "tsyringe";

@singleton()
export class NodeEventBus implements EventBus {
	private emitter = new EventEmitter();

	publish(event: DomainEvent): void {
		this.emitter.emit(event.eventName, event);
	}

	subscribe<E extends DomainEvent>(
		eventName: string,
		handler: (event: E) => void,
	): void {
		this.emitter.on(eventName, handler);
	}

	publishAll(events: DomainEvent[]): void {
		for (const event of events) this.publish(event);
	}
}
