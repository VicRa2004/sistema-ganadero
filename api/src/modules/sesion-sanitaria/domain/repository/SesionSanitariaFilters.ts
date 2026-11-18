import type { Actor } from "@/core/shared/domain/Actor";
import type { EstadoSesionSanitaria } from "../SesionSanitaria";

export interface SesionSanitariaFilters {
	page: number;
	limit: number;
	fechaInicio?: Date;
	fechaFin?: Date;
	veterinarioId?: number;
	insumoId?: number;
	estado?: EstadoSesionSanitaria;
	busqueda?: string;
	/** Actor que consulta; el repositorio restringe por propiedad salvo ADMIN. */
	actor: Actor;
}
