import type { Actor } from "@/core/shared/domain/Actor";
import type { TipoEventoReproductivo } from "../EventoReproductivo";

export interface EventoReproductivoFilters {
	page: number;
	limit: number;
	hembraId?: number;
	ganadoId?: number;
	tipo?: TipoEventoReproductivo;
	desde?: Date;
	hasta?: Date;
	actor: Actor;
}
