import { BaseError } from "@/core/shared/domain/error/BaseError";

export class GanadoNotFoundError extends BaseError {
	constructor(idOrIdentificador: number | string) {
		super(
			`Ganado con ID o identificador ${idOrIdentificador} no encontrado`,
			404,
		);
	}
}
