import type { Actor } from "@/core/shared/domain/Actor";
import type { IndicadoresReproductivosOutputDto } from "../dtos/ReproduccionDto";

export interface IndicadoresReproductivosFilters {
	desde?: Date;
	hasta?: Date;
	actor: Actor;
}

export interface IndicadoresReproductivosQuery {
	obtenerIndicadores(
		filters: IndicadoresReproductivosFilters,
	): Promise<IndicadoresReproductivosOutputDto>;
}
