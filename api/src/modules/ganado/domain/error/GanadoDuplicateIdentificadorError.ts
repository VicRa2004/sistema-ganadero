import { BaseError } from "@/core/shared/domain/error/BaseError";

export class GanadoDuplicateIdentificadorError extends BaseError {
	constructor(identificador: string) {
		super(
			`El identificador de ganado (arete) ${identificador} ya se encuentra registrado`,
			400,
		);
	}
}
