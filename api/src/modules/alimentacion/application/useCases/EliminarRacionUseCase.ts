import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { AlimentacionRepository } from "../../domain/repository/AlimentacionRepository";
import type { AlimentacionAccessService } from "../services/AlimentacionAccessService";

@injectable()
export class EliminarRacionUseCase {
	constructor(
		@inject("AlimentacionRepository")
		private readonly alimentacionRepository: AlimentacionRepository,
		@inject("AlimentacionAccessService")
		private readonly accessService: AlimentacionAccessService,
	) {}

	public async run(id: number, actor: Actor): Promise<void> {
		await this.accessService.obtenerRacion(id, actor);
		await this.alimentacionRepository.deleteRacion(id);
	}
}
