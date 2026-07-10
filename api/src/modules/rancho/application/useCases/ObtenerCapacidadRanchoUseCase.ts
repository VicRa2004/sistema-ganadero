import { inject, injectable } from "tsyringe";
import { RanchoNotFoundError } from "../../domain/error/RanchoNotFoundError";
import type { RanchoRepository } from "../../domain/repository/RanchoRepository";
import type { RanchoCapacidadOutputDto } from "../dtos/RanchoDto";

@injectable()
export class ObtenerCapacidadRanchoUseCase {
	constructor(
		@inject("RanchoRepository")
		private readonly ranchoRepository: RanchoRepository,
	) {}

	public async run(id: number): Promise<RanchoCapacidadOutputDto> {
		const rancho = await this.ranchoRepository.findById(id);
		if (!rancho) {
			throw new RanchoNotFoundError(id);
		}

		const cabezasGanadoActuales =
			await this.ranchoRepository.countGanadoByRanchoId(id);
		const espacioDisponible =
			rancho.getCapacidadMaxima() - cabezasGanadoActuales;

		return {
			id: rancho.getId(),
			nombre: rancho.getNombre(),
			capacidadMaxima: rancho.getCapacidadMaxima(),
			cabezasGanadoActuales,
			espacioDisponible,
		};
	}
}
