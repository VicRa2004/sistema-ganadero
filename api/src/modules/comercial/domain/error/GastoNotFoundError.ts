import { BaseError } from "@/core/shared/domain/error/BaseError";

export class GastoNotFoundError extends BaseError {
	constructor(id: number) {
		super(`Gasto con ID ${id} no fue encontrado`, 404);
	}
}
