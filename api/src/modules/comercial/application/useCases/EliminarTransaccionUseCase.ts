import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { TransaccionRepository } from "../../domain/repository/TransaccionRepository";
import type { ComercialAccessService } from "../services/ComercialAccessService";

@injectable()
export class EliminarTransaccionUseCase {
	constructor(
		@inject("TransaccionRepository")
		private readonly repository: TransaccionRepository,
		@inject("ComercialAccessService")
		private readonly accessService: ComercialAccessService,
	) {}

	public async run(id: number, actor: Actor): Promise<void> {
		await this.accessService.obtenerTransaccion(id, actor);
		await this.repository.delete(id);
	}
}
