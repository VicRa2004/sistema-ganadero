import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";
import type { GanadoOutputDto } from "../dtos/GanadoDto";
import type { GanadoMapper } from "../mappers/GanadoMapper";
import type { GanadoAccessService } from "../services/GanadoAccessService";

@injectable()
export class TrasladarGanadoUseCase {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("GanadoAccessService")
		private readonly accessService: GanadoAccessService,
		@inject("GanadoMapper")
		private readonly mapper: GanadoMapper,
	) {}

	public async run(
		id: number,
		terrenoId: number,
		actor: Actor,
	): Promise<GanadoOutputDto> {
		const ganado = await this.accessService.obtenerGanado(id, actor);

		// El terreno destino debe existir y pertenecer al usuario
		await this.accessService.obtenerTerreno(terrenoId, actor);

		ganado.cambiarDeTerreno(terrenoId);

		const saved = await this.ganadoRepository.save(ganado);
		return this.mapper.toDto(saved);
	}
}
