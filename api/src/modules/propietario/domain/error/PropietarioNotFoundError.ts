import { BaseError } from "@/core/shared/domain/error/BaseError";

export class PropietarioNotFoundError extends BaseError {
	constructor(id: number) {
		super(`Propietario con ID ${id} no encontrado`, 404);
	}
}
