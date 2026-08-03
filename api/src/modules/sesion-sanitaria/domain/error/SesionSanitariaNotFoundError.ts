import { BaseError } from "@/core/shared/domain/error/BaseError";

export class SesionSanitariaNotFoundError extends BaseError {
	constructor(id: number) {
		super(`La sesión sanitaria con ID ${id} no fue encontrada`, 404);
	}
}
