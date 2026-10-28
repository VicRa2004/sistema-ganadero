import { inject, injectable } from "tsyringe";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { TerrenoRepository } from "@/modules/terreno/domain/repository/TerrenoRepository";
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
		@inject("TerrenoRepository")
		private readonly terrenoRepository: TerrenoRepository,
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
		const terreno = await this.accessService.obtenerTerreno(terrenoId, actor);

		if (ganado.getTerrenoId() !== terrenoId) {
			const ocupadas =
				await this.terrenoRepository.countGanadoByRanchoId(terrenoId);
			if (ocupadas >= terreno.getCapacidadMaxima()) {
				throw new BaseError(
					`El terreno destino alcanzó su capacidad máxima (${terreno.getCapacidadMaxima()})`,
					400,
				);
			}
		}

		ganado.cambiarDeTerreno(terrenoId);

		const saved = await this.ganadoRepository.save(ganado);
		return this.mapper.toDto(saved);
	}
}
