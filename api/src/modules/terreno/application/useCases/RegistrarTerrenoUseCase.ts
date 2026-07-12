import { inject, injectable } from "tsyringe";
import type { ImageStorageService } from "@/core/shared/domain/services/ImageStorageService";
import { Terreno } from "../../domain/Terreno";
import type { TerrenoRepository } from "../../domain/repository/TerrenoRepository";
import type {
	RegistrarTerrenoInputDto,
	TerrenoOutputDto,
} from "../dtos/TerrenoDto";
import type { TerrenoMapper } from "../mappers/TerrenoMapper";

@injectable()
export class RegistrarTerrenoUseCase {
	constructor(
		@inject("TerrenoRepository")
		private readonly terrenoRepository: TerrenoRepository,
		@inject("TerrenoMapper")
		private readonly mapper: TerrenoMapper,
		@inject("ImageStorageService")
		private readonly imageStorageService: ImageStorageService,
	) {}

	public async run(dto: RegistrarTerrenoInputDto): Promise<TerrenoOutputDto> {
		let imagenTerrenoPath: string | null = null;
		if (dto.imagenTerreno && dto.imagenTerreno instanceof File) {
			imagenTerrenoPath = await this.imageStorageService.upload(
				dto.imagenTerreno,
				"terrenos",
			);
		}

		const terreno = Terreno.create(
			dto.nombre,
			dto.ubicacion,
			dto.extensionHectareas,
			dto.capacidadMaxima,
			imagenTerrenoPath,
			dto.usuarioId,
		);

		const saved = await this.terrenoRepository.save(terreno);
		return this.mapper.toDto(saved);
	}
}
