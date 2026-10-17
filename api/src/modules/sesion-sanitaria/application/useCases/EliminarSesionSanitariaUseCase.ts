import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { SesionSanitariaRepository } from "../../domain/repository/SesionSanitariaRepository";
import type { SesionAccessService } from "../services/SesionAccessService";

@injectable()
export class EliminarSesionSanitariaUseCase {
	constructor(
		@inject("SesionSanitariaRepository")
		private readonly sesionSanitariaRepository: SesionSanitariaRepository,
		@inject("SesionAccessService")
		private readonly accessService: SesionAccessService,
	) {}

	public async run(id: number, actor: Actor): Promise<void> {
		await this.accessService.obtenerSesion(id, actor);

		await this.sesionSanitariaRepository.delete(id);
	}
}
