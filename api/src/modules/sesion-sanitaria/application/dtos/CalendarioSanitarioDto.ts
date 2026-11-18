import type { EstadoSesionSanitaria } from "../../domain/SesionSanitaria";

export type TipoEventoCalendario =
	| "SESION_SANITARIA"
	| "TRATAMIENTO_MEDICO"
	| "CADUCIDAD_INSUMO";

export interface CalendarioEventoDto {
	id: string;
	tipo: TipoEventoCalendario;
	fecha: string;
	titulo: string;
	subtitulo: string;
	estado: EstadoSesionSanitaria | "ACTIVO" | "CONCLUIDO" | "POR_CADUCAR";
	referenciaId: number;
	ganadoId?: number;
	terrenoId?: number;
}

export interface CalendarioSanitarioOutputDto {
	desde: string;
	hasta: string;
	eventos: CalendarioEventoDto[];
}
