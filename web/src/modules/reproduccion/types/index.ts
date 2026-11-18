import type { PaginatedResponse, SexoGanado } from "@/modules/ganado/types";

export type TipoEventoReproductivo =
	| "MONTA"
	| "INSEMINACION"
	| "DIAGNOSTICO_GESTACION"
	| "PARTO"
	| "DESTETE"
	| "ABORTO";

export type ResultadoDiagnostico = "POSITIVO" | "NEGATIVO";

export const TIPO_EVENTO_LABELS: Record<TipoEventoReproductivo, string> = {
	MONTA: "Monta natural",
	INSEMINACION: "Inseminación",
	DIAGNOSTICO_GESTACION: "Diagnóstico de gestación",
	PARTO: "Parto",
	DESTETE: "Destete",
	ABORTO: "Aborto",
};

export interface CriaPartoInput {
	identificador: string;
	sexo: SexoGanado;
	peso: number;
	razaId?: number;
	terrenoId?: number;
	propietarioId?: number;
}

export interface RegistrarEventoReproductivoInput {
	hembraId: number;
	machoId?: number | null;
	tipo: TipoEventoReproductivo;
	fecha: string;
	resultado?: ResultadoDiagnostico | null;
	fechaProbableParto?: string | null;
	observaciones?: string | null;
	crias?: CriaPartoInput[];
}

export interface EventoReproductivoDto {
	id: number;
	hembraId: number;
	hembraIdentificador: string | null;
	machoId: number | null;
	machoIdentificador: string | null;
	tipo: TipoEventoReproductivo;
	fecha: string;
	resultado: ResultadoDiagnostico | null;
	fechaProbableParto: string | null;
	observaciones: string | null;
	crias: { id: number; identificador: string; sexo: SexoGanado }[];
}

export interface ProximoPartoDto {
	eventoId: number;
	hembraId: number;
	hembraIdentificador: string;
	machoId: number | null;
	machoIdentificador: string | null;
	fechaProbableParto: string;
	diasRestantes: number;
}

export interface IndicadoresReproductivosDto {
	totalEventos: number;
	montasEInseminaciones: number;
	diagnosticosPositivos: number;
	diagnosticosNegativos: number;
	partosEnPeriodo: number;
	abortosEnPeriodo: number;
	tasaPrenez: number | null;
	intervaloEntrePartosDias: number | null;
	proximosPartos: ProximoPartoDto[];
}

export interface EventoReproductivoFilters {
	page: number;
	limit: number;
	hembraId?: number;
	ganadoId?: number;
	tipo?: TipoEventoReproductivo;
	desde?: string;
	hasta?: string;
}

export type EventosReproductivosPaginated =
	PaginatedResponse<EventoReproductivoDto>;
