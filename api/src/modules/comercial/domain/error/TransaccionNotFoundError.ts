import { BaseError } from "@/core/shared/domain/error/BaseError";

export class TransaccionNotFoundError extends BaseError {
	constructor(id: number) {
		super(`Transacción comercial con ID ${id} no fue encontrada`, 404);
	}
}
