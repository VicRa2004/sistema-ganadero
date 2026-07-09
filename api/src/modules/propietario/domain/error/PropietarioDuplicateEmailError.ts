import { BaseError } from "@/core/shared/domain/error/BaseError";

export class PropietarioDuplicateEmailError extends BaseError {
	constructor(correo: string) {
		super(
			`El correo electrónico ${correo} ya está registrado para otro propietario`,
			409,
		);
	}
}
