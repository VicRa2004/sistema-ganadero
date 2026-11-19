import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { GastoRepository } from "../../domain/repository/GastoRepository";
import type { ComercialAccessService } from "../services/ComercialAccessService";

@injectable()
export class EliminarGastoUseCase {
	constructor(
		@inject("GastoRepository")
		private readonly repository: GastoRepository,
		@inject("ComercialAccessService")
		private readonly accessService: ComercialAccessService,
	) {}

	public async run(id: number, actor: Actor): Promise<void> {
		await this.accessService.obtenerGasto(id, actor);
		await this.repository.delete(id);
	}
}
