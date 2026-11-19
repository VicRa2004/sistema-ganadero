import type { Actor } from "@/core/shared/domain/Actor";

export interface RacionFilters {
	page: number;
	limit: number;
	actor: Actor;
	activo?: boolean;
	terrenoId?: number;
	loteId?: number;
}

export interface SuministroFilters {
	page: number;
	limit: number;
	actor: Actor;
	racionId?: number;
	desde?: Date;
	hasta?: Date;
}
