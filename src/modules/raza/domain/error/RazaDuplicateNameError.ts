import { BaseError } from "@/core/shared/domain/error/BaseError";

export class RazaDuplicateNameError extends BaseError {
	constructor(nombre: string) {
		super(`La raza con el nombre '${nombre}' ya existe en el catálogo`, 409);
	}
}
