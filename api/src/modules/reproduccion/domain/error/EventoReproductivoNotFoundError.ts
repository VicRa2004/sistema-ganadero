import { BaseError } from "@/core/shared/domain/error/BaseError";

export class EventoReproductivoNotFoundError extends BaseError {
	constructor(id: number) {
		super(`Evento reproductivo con ID ${id} no fue encontrado`, 404);
	}
}
