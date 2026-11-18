import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { SesionSanitariaRepository } from "../../domain/repository/SesionSanitariaRepository";
import type { SesionSanitariaOutputDto } from "../dtos/SesionSanitariaDto";
import type { SesionSanitariaMapper } from "../mappers/SesionSanitariaMapper";
import type { SesionAccessService } from "../services/SesionAccessService";

@injectable()
export class CancelarSesionSanitariaUseCase {
	constructor(
		@inject("SesionSanitariaRepository")
		private readonly sesionRepository: SesionSanitariaRepository,
		@inject("SesionAccessService")
		private readonly accessService: SesionAccessService,
		@inject("SesionSanitariaMapper")
		private readonly mapper: SesionSanitariaMapper,
	) {}

	public async run(
		id: number,
		actor: Actor,
	): Promise<SesionSanitariaOutputDto> {
		const sesion = await this.accessService.obtenerSesion(id, actor);
		sesion.cancelar();
		const guardada = await this.sesionRepository.save(sesion);
		return this.mapper.toDto(guardada);
	}
}
