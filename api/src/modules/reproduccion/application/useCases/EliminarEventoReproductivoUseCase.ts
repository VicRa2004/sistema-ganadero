import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import { EventoReproductivoNotFoundError } from "../../domain/error/EventoReproductivoNotFoundError";
import type { EventoReproductivoRepository } from "../../domain/repository/EventoReproductivoRepository";

@injectable()
export class EliminarEventoReproductivoUseCase {
	constructor(
		@inject("EventoReproductivoRepository")
		private readonly repo: EventoReproductivoRepository,
		@inject("GanadoAccessService")
		private readonly ganadoAccess: GanadoAccessService,
	) {}

	public async run(id: number, actor: Actor): Promise<void> {
		const evento = await this.repo.findById(id);
		if (!evento) {
			throw new EventoReproductivoNotFoundError(id);
		}
		await this.ganadoAccess.obtenerGanado(evento.getHembraId(), actor);
		await this.repo.delete(id);
	}
}
