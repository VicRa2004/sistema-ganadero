import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";
import type { GanadoAccessService } from "../services/GanadoAccessService";

@injectable()
export class EliminarGanadoUseCase {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("GanadoAccessService")
		private readonly accessService: GanadoAccessService,
	) {}

	public async run(id: number, actor: Actor): Promise<void> {
		await this.accessService.obtenerGanado(id, actor);
		await this.ganadoRepository.delete(id);
	}
}
