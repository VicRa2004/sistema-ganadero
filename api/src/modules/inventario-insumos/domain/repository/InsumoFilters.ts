import type { Actor } from "@/core/shared/domain/Actor";

export interface InsumoFilters {
	page: number;
	limit: number;
	nombre?: string;
	tipo?: string;
	actor: Actor;
}
