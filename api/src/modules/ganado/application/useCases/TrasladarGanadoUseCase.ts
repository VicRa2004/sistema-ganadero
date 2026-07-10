import { inject, injectable } from "tsyringe";
import { GanadoNotFoundError } from "../../domain/error/GanadoNotFoundError";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";
import type { GanadoOutputDto } from "../dtos/GanadoDto";
import type { GanadoMapper } from "../mappers/GanadoMapper";

// Repositorio y errores externos
import type { RanchoRepository } from "@/modules/rancho/domain/repository/RanchoRepository";
import { RanchoNotFoundError } from "@/modules/rancho/domain/error/RanchoNotFoundError";

@injectable()
export class TrasladarGanadoUseCase {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("RanchoRepository")
		private readonly ranchoRepository: RanchoRepository,
		@inject("GanadoMapper")
		private readonly mapper: GanadoMapper,
	) {}

	public async run(id: number, ranchoId: number): Promise<GanadoOutputDto> {
		const ganado = await this.ganadoRepository.findById(id);
		if (!ganado) {
			throw new GanadoNotFoundError(id);
		}

		// Validar que el rancho destino exista
		const rancho = await this.ranchoRepository.findById(ranchoId);
		if (!rancho) {
			throw new RanchoNotFoundError(ranchoId);
		}

		ganado.cambiarDeRancho(ranchoId);

		const saved = await this.ganadoRepository.save(ganado);
		return this.mapper.toDto(saved);
	}
}
