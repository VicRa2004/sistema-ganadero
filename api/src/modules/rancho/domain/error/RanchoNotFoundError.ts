import { BaseError } from "@/core/shared/domain/error/BaseError";

export class RanchoNotFoundError extends BaseError {
	constructor(id: number) {
		super(`Rancho con ID ${id} no encontrado`, 404);
	}
}
