import { inject, injectable } from "tsyringe";
import type { ImageStorageService } from "@/core/shared/domain/services/ImageStorageService";
import { TerrenoNotFoundError } from "../../domain/error/TerrenoNotFoundError";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { TerrenoRepository } from "../../domain/repository/TerrenoRepository";
import type {
	ActualizarTerrenoInputDto,
	TerrenoOutputDto,
} from "../dtos/TerrenoDto";
import type { TerrenoMapper } from "../mappers/TerrenoMapper";

@injectable()
export class ActualizarTerrenoUseCase {
	constructor(
		@inject("TerrenoRepository")
		private readonly terrenoRepository: TerrenoRepository,
		@inject("TerrenoMapper")
		private readonly mapper: TerrenoMapper,
		@inject("ImageStorageService")
		private readonly imageStorageService: ImageStorageService,
	) {}

	public async run(
		id: number,
		dto: ActualizarTerrenoInputDto,
		usuarioId: number,
		rol: string,
	): Promise<TerrenoOutputDto> {
		const terreno = await this.terrenoRepository.findById(id);
		if (!terreno) {
			throw new TerrenoNotFoundError(id);
		}

		if (rol !== "ADMIN" && terreno.getUsuarioId() !== usuarioId) {
			throw new BaseError("No tienes permiso para acceder a este terreno", 403);
		}

		let imagenTerrenoPath = terreno.getImagenTerreno();

		if (dto.imagenTerreno && dto.imagenTerreno instanceof File) {
			if (imagenTerrenoPath) {
				await this.imageStorageService.delete(imagenTerrenoPath);
			}
			imagenTerrenoPath = await this.imageStorageService.upload(
				dto.imagenTerreno,
				"terrenos",
			);
		} else if (dto.imagenTerreno === null) {
			if (imagenTerrenoPath) {
				await this.imageStorageService.delete(imagenTerrenoPath);
			}
			imagenTerrenoPath = null;
		}

		const nombre = dto.nombre ?? terreno.getNombre();
		const ubicacion = dto.ubicacion ?? terreno.getUbicacion();
		const extensionHectareas =
			dto.extensionHectareas ?? terreno.getExtensionHectareas();
		const capacidadMaxima = dto.capacidadMaxima ?? terreno.getCapacidadMaxima();

		terreno.actualizarInformacionFisica(
			nombre,
			ubicacion,
			extensionHectareas,
			capacidadMaxima,
			imagenTerrenoPath,
		);

		const saved = await this.terrenoRepository.save(terreno);
		return this.mapper.toDto(saved);
	}
}
