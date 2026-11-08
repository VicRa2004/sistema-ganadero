import { BaseError } from "@/core/shared/domain/error/BaseError";

export class TratamientoMedicoNotFoundError extends BaseError {
	constructor(id: number) {
		super(`El tratamiento médico con ID ${id} no fue encontrado`, 404);
	}
}
