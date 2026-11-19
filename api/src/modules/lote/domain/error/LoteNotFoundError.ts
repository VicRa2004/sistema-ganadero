import { BaseError } from "@/core/shared/domain/error/BaseError";

export class LoteNotFoundError extends BaseError {
	constructor(id: number) {
		super(`Lote con ID ${id} no fue encontrado`, 404);
	}
}
