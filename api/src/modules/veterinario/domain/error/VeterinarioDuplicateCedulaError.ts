import { BaseError } from "@/core/shared/domain/error/BaseError";

export class VeterinarioDuplicateCedulaError extends BaseError {
	constructor(cedula: string) {
		super(
			`Ya existe un veterinario registrado con la cédula profesional: ${cedula}`,
			400,
		);
	}
}
