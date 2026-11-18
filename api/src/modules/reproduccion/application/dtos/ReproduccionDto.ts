import type { SexoGanado } from "@/modules/ganado/domain/Ganado";
import type {
	ResultadoDiagnostico,
	TipoEventoReproductivo,
} from "../../domain/EventoReproductivo";

export interface RegistrarCriaPartoDto {
	identificador: string;
	sexo: SexoGanado;
	peso: number;
	razaId?: number;
	terrenoId?: number;
	propietarioId?: number;
}

export interface RegistrarEventoReproductivoInputDto {
	hembraId: number;
	machoId?: number | null;
	tipo: TipoEventoReproductivo;
	fecha: string;
	resultado?: ResultadoDiagnostico | null;
	fechaProbableParto?: string | null;
	observaciones?: string | null;
	crias?: RegistrarCriaPartoDto[];
}

export interface EventoReproductivoOutputDto {
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

export interface IndicadoresReproductivosOutputDto {
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
