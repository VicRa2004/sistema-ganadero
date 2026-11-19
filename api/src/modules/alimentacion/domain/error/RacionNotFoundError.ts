import { BaseError } from "@/core/shared/domain/error/BaseError";

export class RacionNotFoundError extends BaseError {
	constructor(id: number) {
		super(`Ración de alimentación con ID ${id} no fue encontrada`, 404);
	}
}
