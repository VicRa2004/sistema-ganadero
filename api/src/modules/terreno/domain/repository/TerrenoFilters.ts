import type { Actor } from "@/core/shared/domain/Actor";

export interface TerrenoFilters {
	page: number;
	limit: number;
	nombre?: string;
	actor: Actor;
}
