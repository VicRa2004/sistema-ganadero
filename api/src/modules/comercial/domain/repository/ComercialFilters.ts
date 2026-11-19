import type { Actor } from "@/core/shared/domain/Actor";
import type { CategoriaGasto, TipoTransaccion } from "../CategoriaGasto";

export interface TransaccionFilters {
	page: number;
	limit: number;
	actor: Actor;
	tipo?: TipoTransaccion;
	desde?: Date;
	hasta?: Date;
}

export interface GastoFilters {
	page: number;
	limit: number;
	actor: Actor;
	categoria?: CategoriaGasto;
	terrenoId?: number;
	ganadoId?: number;
	loteId?: number;
	desde?: Date;
	hasta?: Date;
}
