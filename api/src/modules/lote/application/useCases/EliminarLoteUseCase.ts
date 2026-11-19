import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { LoteRepository } from "../../domain/repository/LoteRepository";
import type { LoteAccessService } from "../services/LoteAccessService";

@injectable()
export class EliminarLoteUseCase {
	constructor(
		@inject("LoteRepository")
		private readonly loteRepository: LoteRepository,
		@inject("LoteAccessService")
		private readonly accessService: LoteAccessService,
	) {}

	public async run(id: number, actor: Actor): Promise<void> {
		await this.accessService.obtenerLote(id, actor);
		await this.loteRepository.delete(id);
	}
}
