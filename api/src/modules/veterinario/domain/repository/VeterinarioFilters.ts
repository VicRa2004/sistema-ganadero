import type { Actor } from "@/core/shared/domain/Actor";

export interface VeterinarioFilters {
	page: number;
	limit: number;
	nombre?: string;
	especialidad?: string;
	actor: Actor;
}
