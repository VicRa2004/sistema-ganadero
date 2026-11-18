import type { Actor } from "@/core/shared/domain/Actor";
import type { SexoGanado } from "../Ganado";

export interface GanadoFilters {
	page: number;
	limit: number;
	identificador?: string;
	terrenoId?: number;
	razaId?: number;
	propietarioId?: number;
	sexo?: SexoGanado;
	/** Actor que consulta; el repositorio restringe por propiedad salvo ADMIN. */
	actor: Actor;
	/** Si es true (valor por defecto), excluye ganados con fechaBaja establecida */
	soloActivos?: boolean;
}
