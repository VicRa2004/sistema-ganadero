import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { GanadoNotFoundError } from "../../domain/error/GanadoNotFoundError";
import type { GenealogiaOutputDto } from "../dtos/GanadoDto";
import type { GanadoDetalleQuery } from "../queries/GanadoDetalleQuery";

@injectable()
export class ObtenerGenealogiaUseCase {
	constructor(
		@inject("GanadoDetalleQuery")
		private readonly query: GanadoDetalleQuery,
	) {}

	public async run(
		ganadoId: number,
		generaciones: number,
		actor: Actor,
	): Promise<GenealogiaOutputDto> {
		const result = await this.query.obtenerGenealogia(
			ganadoId,
			generaciones,
			actor,
		);
		if (!result) {
			throw new GanadoNotFoundError(ganadoId);
		}
		return result;
	}
}
