import { BaseError } from "@/core/shared/domain/error/BaseError";

export class RazaNotFoundError extends BaseError {
	constructor(id: number) {
		super(`Raza con ID ${id} no encontrada`, 404);
	}
}
