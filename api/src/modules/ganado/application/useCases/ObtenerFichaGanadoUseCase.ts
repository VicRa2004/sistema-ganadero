import { inject, injectable } from "tsyringe";
import { GanadoNotFoundError } from "../../domain/error/GanadoNotFoundError";
import type { GanadoDetalleOutputDto } from "../dtos/GanadoDto";
import type { GanadoDetalleQuery } from "../queries/GanadoDetalleQuery";

@injectable()
export class ObtenerFichaGanadoUseCase {
	constructor(
		@inject("GanadoDetalleQuery")
		private readonly query: GanadoDetalleQuery,
	) {}

	public async run(
		idOrIdentificador: number | string,
	): Promise<GanadoDetalleOutputDto> {
		let result: GanadoDetalleOutputDto | null = null;

		if (typeof idOrIdentificador === "number") {
			result = await this.query.obtenerFichaPorId(idOrIdentificador);
		} else {
			// Si es string, podemos intentar parsear a número primero
			const parsedId = Number(idOrIdentificador);
			if (!Number.isNaN(parsedId)) {
				result = await this.query.obtenerFichaPorId(parsedId);
			} else {
				result =
					await this.query.obtenerFichaPorIdentificador(idOrIdentificador);
			}
		}

		if (!result) {
			throw new GanadoNotFoundError(idOrIdentificador);
		}

		return result;
	}
}
