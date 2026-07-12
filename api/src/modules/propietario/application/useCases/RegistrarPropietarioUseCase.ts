import { inject, injectable } from "tsyringe";
import type { ImageStorageService } from "@/core/shared/domain/services/ImageStorageService";
import { Propietario } from "../../domain/Propietario";
import { PropietarioDuplicateEmailError } from "../../domain/error/PropietarioDuplicateEmailError";
import type { PropietarioRepository } from "../../domain/repository/PropietarioRepository";
import type {
	RegistrarPropietarioInputDto,
	PropietarioOutputDto,
} from "../dtos/PropietarioDto";
import type { PropietarioMapper } from "../mappers/PropietarioMapper";

@injectable()
export class RegistrarPropietarioUseCase {
	constructor(
		@inject("PropietarioRepository")
		private readonly propietarioRepository: PropietarioRepository,
		@inject("PropietarioMapper")
		private readonly mapper: PropietarioMapper,
		@inject("ImageStorageService")
		private readonly imageStorageService: ImageStorageService,
	) {}

	public async run(
		dto: RegistrarPropietarioInputDto,
	): Promise<PropietarioOutputDto> {
		if (dto.correo && dto.correo.trim() !== "") {
			const existing = await this.propietarioRepository.findByEmail(dto.correo);
			if (existing) {
				throw new PropietarioDuplicateEmailError(dto.correo);
			}
		}

		let imagenMarcaPath: string | null = null;
		if (dto.imagenMarca && dto.imagenMarca instanceof File) {
			imagenMarcaPath = await this.imageStorageService.upload(
				dto.imagenMarca,
				"propietarios",
			);
		}

		const propietario = Propietario.create(
			dto.nombre,
			dto.telefono ?? null,
			dto.correo ?? null,
			imagenMarcaPath,
		);

		const saved = await this.propietarioRepository.save(propietario);
		return this.mapper.toDto(saved);
	}
}
