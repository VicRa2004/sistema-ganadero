import { BaseError } from "@/core/shared/domain/error/BaseError";

export class TerrenoNotFoundError extends BaseError {
	constructor(id: number) {
		super(`Terreno con ID ${id} no encontrado`, 404);
	}
}
