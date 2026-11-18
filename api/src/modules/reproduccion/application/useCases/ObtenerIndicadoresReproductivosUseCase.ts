import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { IndicadoresReproductivosOutputDto } from "../dtos/ReproduccionDto";
import type { IndicadoresReproductivosQuery } from "../queries/IndicadoresReproductivosQuery";

@injectable()
export class ObtenerIndicadoresReproductivosUseCase {
	constructor(
		@inject("IndicadoresReproductivosQuery")
		private readonly query: IndicadoresReproductivosQuery,
	) {}

	public async run(
		filters: { desde?: Date; hasta?: Date },
		actor: Actor,
	): Promise<IndicadoresReproductivosOutputDto> {
		return this.query.obtenerIndicadores({
			...filters,
			actor,
		});
	}
}
