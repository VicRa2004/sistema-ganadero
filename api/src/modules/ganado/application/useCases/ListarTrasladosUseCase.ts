import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";
import type { TrasladoOutputDto } from "../dtos/GanadoDto";
import type { GanadoAccessService } from "../services/GanadoAccessService";

@injectable()
export class ListarTrasladosUseCase {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("GanadoAccessService")
		private readonly accessService: GanadoAccessService,
	) {}

	public async run(id: number, actor: Actor): Promise<TrasladoOutputDto[]> {
		await this.accessService.obtenerGanado(id, actor);
		const traslados = await this.ganadoRepository.findTraslados(id);
		return traslados.map((t) => ({ ...t, fecha: t.fecha.toISOString() }));
	}
}
