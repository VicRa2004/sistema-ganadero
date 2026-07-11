import { inject, injectable } from "tsyringe";
import { RanchoNotFoundError } from "../../domain/error/RanchoNotFoundError";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { RanchoRepository } from "../../domain/repository/RanchoRepository";
import type { RanchoCapacidadOutputDto } from "../dtos/RanchoDto";

@injectable()
export class ObtenerCapacidadRanchoUseCase {
	constructor(
		@inject("RanchoRepository")
		private readonly ranchoRepository: RanchoRepository,
	) {}

	public async run(
		id: number,
		usuarioId: number,
		rol: string,
	): Promise<RanchoCapacidadOutputDto> {
		const rancho = await this.ranchoRepository.findById(id);
		if (!rancho) {
			throw new RanchoNotFoundError(id);
		}

		if (rol !== "ADMIN" && rancho.getUsuarioId() !== usuarioId) {
			throw new BaseError("No tienes permiso para acceder a este rancho", 403);
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
