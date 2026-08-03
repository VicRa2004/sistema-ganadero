import type { SexoGanado } from "../Ganado";

export interface GanadoFilters {
	page: number;
	limit: number;
	identificador?: string;
	terrenoId?: number;
	razaId?: number;
	propietarioId?: number;
	sexo?: SexoGanado;
	/** Si es true (valor por defecto), excluye ganados con fechaBaja establecida */
	soloActivos?: boolean;
}
