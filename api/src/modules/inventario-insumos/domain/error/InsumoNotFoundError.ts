import { BaseError } from "@/core/shared/domain/error/BaseError";

export class InsumoNotFoundError extends BaseError {
	constructor(id: number) {
		super(`Insumo con ID ${id} no encontrado`, 404);
	}
}
