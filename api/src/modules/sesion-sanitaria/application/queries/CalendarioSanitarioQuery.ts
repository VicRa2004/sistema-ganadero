import type { Actor } from "@/core/shared/domain/Actor";
import type { CalendarioEventoDto } from "../dtos/CalendarioSanitarioDto";

export interface CalendarioSanitarioFilters {
	desde: Date;
	hasta: Date;
	actor: Actor;
	terrenoId?: number;
	ganadoId?: number;
}

export interface CalendarioSanitarioQuery {
	obtenerEventos(
		filters: CalendarioSanitarioFilters,
	): Promise<CalendarioEventoDto[]>;
}
