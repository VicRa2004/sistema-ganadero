import type { Pagination } from "@/core/shared/domain/Pagination";
import type { EventoReproductivo } from "../EventoReproductivo";
import type { EventoReproductivoFilters } from "./EventoReproductivoFilters";

export interface EventoReproductivoRepository {
	save(evento: EventoReproductivo): Promise<EventoReproductivo>;
	findById(id: number): Promise<EventoReproductivo | null>;
	findAll(
		filters: EventoReproductivoFilters,
	): Promise<Pagination<EventoReproductivo>>;
	/**
	 * Busca la última MONTA o INSEMINACION de la hembra hasta `hastaFecha`
	 * que no haya sido cerrada por un PARTO o ABORTO posterior.
	 */
	findUltimoServicioAbierto(
		hembraId: number,
		hastaFecha: Date,
	): Promise<EventoReproductivo | null>;
	vincularCrias(eventoId: number, criaIds: number[]): Promise<void>;
	delete(id: number): Promise<void>;
}
