import { BaseError } from "@/core/shared/domain/error/BaseError";

export class InsumoCantidadInvalidaError extends BaseError {
	constructor(message: string) {
		super(message, 400);
	}
}
