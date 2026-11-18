import type { Actor } from "@/core/shared/domain/Actor";

export interface PropietarioFilters {
	page: number;
	limit: number;
	nombre?: string;
	/** Actor que consulta; el repositorio restringe por propiedad salvo ADMIN. */
	actor: Actor;
}
