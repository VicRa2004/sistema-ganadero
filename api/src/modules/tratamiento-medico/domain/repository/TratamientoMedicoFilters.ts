import type { Actor } from "@/core/shared/domain/Actor";

export interface TratamientoMedicoFilters {
	page: number;
	limit: number;
	ganadoId?: number;
	activo?: boolean;
	insumoId?: number;
	veterinarioId?: number;
	search?: string;
	/** Actor que consulta; el repositorio restringe por propiedad salvo ADMIN. */
	actor: Actor;
}
