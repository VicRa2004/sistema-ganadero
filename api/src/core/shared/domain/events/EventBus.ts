import type { DomainEvent } from "./DomainEvent";

export interface EventBus {
	publish(event: DomainEvent): void;
	publishAll(events: DomainEvent[]): void;
	subscribe<E extends DomainEvent>(
		eventName: string,
		handler: (event: E) => void,
	): void;
}
