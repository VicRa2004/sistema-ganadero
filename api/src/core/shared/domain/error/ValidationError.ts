import { BaseError } from "./BaseError";

/** Violación de una regla de validación del dominio o de la petición (HTTP 400). */
export class ValidationError extends BaseError {
	constructor(message: string) {
		super(message, 400);
	}
}
