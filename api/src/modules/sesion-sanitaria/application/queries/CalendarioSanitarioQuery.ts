import type { CalendarioEventoDto } from "../dtos/CalendarioSanitarioDto";

export interface CalendarioSanitarioFilters {
	desde: Date;
	hasta: Date;
	usuarioId?: number;
	terrenoId?: number;
	ganadoId?: number;
}

export interface CalendarioSanitarioQuery {
	obtenerEventos(
		filters: CalendarioSanitarioFilters,
	): Promise<CalendarioEventoDto[]>;
}
