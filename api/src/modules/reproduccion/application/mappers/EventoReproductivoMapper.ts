import { injectable } from "tsyringe";
import type { EventoReproductivo } from "../../domain/EventoReproductivo";
import type { EventoReproductivoOutputDto } from "../dtos/ReproduccionDto";

@injectable()
export class EventoReproductivoMapper {
	public toDto(evento: EventoReproductivo): EventoReproductivoOutputDto {
		const rel = evento.getRelaciones();
		return {
			id: evento.getId(),
			hembraId: evento.getHembraId(),
			hembraIdentificador: rel?.hembraIdentificador ?? null,
			machoId: evento.getMachoId(),
			machoIdentificador: rel?.machoIdentificador ?? null,
			tipo: evento.getTipo(),
			fecha: evento.getFecha().toISOString().split("T")[0] ?? "",
			resultado: evento.getResultado(),
			fechaProbableParto: evento.getFechaProbableParto()
				? (evento.getFechaProbableParto()?.toISOString().split("T")[0] ?? null)
				: null,
			observaciones: evento.getObservaciones(),
			crias: rel?.crias ?? [],
		};
	}
}
