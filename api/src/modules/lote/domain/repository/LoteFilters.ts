import type { Actor } from "@/core/shared/domain/Actor";
import type { PropositoLote } from "../PropositoLote";

export interface LoteFilters {
	page: number;
	limit: number;
	actor: Actor;
	nombre?: string;
	proposito?: PropositoLote;
	activo?: boolean;
}
