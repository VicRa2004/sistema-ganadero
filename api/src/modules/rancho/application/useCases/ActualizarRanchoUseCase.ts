import { inject, injectable } from "tsyringe";
import { RanchoNotFoundError } from "../../domain/error/RanchoNotFoundError";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { RanchoRepository } from "../../domain/repository/RanchoRepository";
import type {
	ActualizarRanchoInputDto,
	RanchoOutputDto,
} from "../dtos/RanchoDto";
import type { RanchoMapper } from "../mappers/RanchoMapper";

@injectable()
export class ActualizarRanchoUseCase {
	constructor(
		@inject("RanchoRepository")
		private readonly ranchoRepository: RanchoRepository,
		@inject("RanchoMapper")
		private readonly mapper: RanchoMapper,
	) {}

	public async run(
		id: number,
		dto: ActualizarRanchoInputDto,
		usuarioId: number,
		rol: string,
	): Promise<RanchoOutputDto> {
		const rancho = await this.ranchoRepository.findById(id);
		if (!rancho) {
			throw new RanchoNotFoundError(id);
		}

		if (rol !== "ADMIN" && rancho.getUsuarioId() !== usuarioId) {
			throw new BaseError("No tienes permiso para acceder a este rancho", 403);
		}

		const nombre = dto.nombre ?? rancho.getNombre();
		const ubicacion = dto.ubicacion ?? rancho.getUbicacion();
		const extensionHectareas =
			dto.extensionHectareas ?? rancho.getExtensionHectareas();
		const capacidadMaxima = dto.capacidadMaxima ?? rancho.getCapacidadMaxima();

		rancho.actualizarInformacionFisica(
			nombre,
			ubicacion,
			extensionHectareas,
			capacidadMaxima,
		);

		const saved = await this.ranchoRepository.save(rancho);
		return this.mapper.toDto(saved);
	}
}
