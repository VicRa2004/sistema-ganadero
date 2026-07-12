import { BaseError } from "@/core/shared/domain/error/BaseError";

export class VeterinarioNotFoundError extends BaseError {
	constructor(id: number) {
		super(`Veterinario con ID ${id} no fue encontrado`, 404);
	}
}
