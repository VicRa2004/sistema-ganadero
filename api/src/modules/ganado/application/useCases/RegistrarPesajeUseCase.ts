import { inject, injectable } from "tsyringe";
import { GanadoNotFoundError } from "../../domain/error/GanadoNotFoundError";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";
import type { GanadoOutputDto } from "../dtos/GanadoDto";
import type { GanadoMapper } from "../mappers/GanadoMapper";

@injectable()
export class RegistrarPesajeUseCase {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("GanadoMapper")
		private readonly mapper: GanadoMapper,
	) {}

	public async run(id: number, peso: number): Promise<GanadoOutputDto> {
		const ganado = await this.ganadoRepository.findById(id);
		if (!ganado) {
			throw new GanadoNotFoundError(id);
		}

		ganado.registrarPesaje(peso);

		const saved = await this.ganadoRepository.save(ganado);
		return this.mapper.toDto(saved);
	}
}
