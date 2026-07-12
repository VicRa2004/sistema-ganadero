import { inject, injectable } from "tsyringe";
import { GanadoNotFoundError } from "../../domain/error/GanadoNotFoundError";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";
import type { GanadoOutputDto } from "../dtos/GanadoDto";
import type { GanadoMapper } from "../mappers/GanadoMapper";

// Repositorio y errores externos
import type { TerrenoRepository } from "@/modules/terreno/domain/repository/TerrenoRepository";
import { TerrenoNotFoundError } from "@/modules/terreno/domain/error/TerrenoNotFoundError";

@injectable()
export class TrasladarGanadoUseCase {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("TerrenoRepository")
		private readonly terrenoRepository: TerrenoRepository,
		@inject("GanadoMapper")
		private readonly mapper: GanadoMapper,
	) {}

	public async run(id: number, terrenoId: number): Promise<GanadoOutputDto> {
		const ganado = await this.ganadoRepository.findById(id);
		if (!ganado) {
			throw new GanadoNotFoundError(id);
		}

		// Validar que el terreno destino exista
		const terreno = await this.terrenoRepository.findById(terrenoId);
		if (!terreno) {
			throw new TerrenoNotFoundError(terrenoId);
		}

		ganado.cambiarDeTerreno(terrenoId);

		const saved = await this.ganadoRepository.save(ganado);
		return this.mapper.toDto(saved);
	}
}
