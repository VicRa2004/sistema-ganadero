import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { GanadoAccessService } from "../services/GanadoAccessService";
import type { GanadoLinajeService } from "../services/GanadoLinajeService";
import type { ImageStorageService } from "@/core/shared/domain/services/ImageStorageService";
import { Ganado } from "../../domain/Ganado";
import { GanadoDuplicateIdentificadorError } from "../../domain/error/GanadoDuplicateIdentificadorError";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";

import type {
	RegistrarGanadoInputDto,
	GanadoOutputDto,
} from "../dtos/GanadoDto";
import type { GanadoMapper } from "../mappers/GanadoMapper";

// Repositorios externos para validación
import type { RazaRepository } from "@/modules/raza/domain/repository/RazaRepository";

// Errores externos
import { RazaNotFoundError } from "@/modules/raza/domain/error/RazaNotFoundError";

@injectable()
export class RegistrarGanadoUseCase {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("RazaRepository")
		private readonly razaRepository: RazaRepository,
		@inject("GanadoAccessService")
		private readonly accessService: GanadoAccessService,
		@inject("GanadoLinajeService")
		private readonly linajeService: GanadoLinajeService,
		@inject("GanadoMapper")
		private readonly mapper: GanadoMapper,
		@inject("ImageStorageService")
		private readonly imageStorageService: ImageStorageService,
	) {}

	public async run(
		dto: RegistrarGanadoInputDto,
		actor: Actor,
	): Promise<GanadoOutputDto> {
		// 1. Validar que el identificador del arete sea único
		const existing = await this.ganadoRepository.findByIdentificador(
			dto.identificador,
		);
		if (existing) {
			throw new GanadoDuplicateIdentificadorError(dto.identificador);
		}

		// 2. Validar que la raza exista
		const raza = await this.razaRepository.findById(dto.razaId);
		if (!raza) {
			throw new RazaNotFoundError(dto.razaId);
		}

		// 3. Validar que el terreno exista y pertenezca al usuario
		await this.accessService.obtenerTerreno(dto.terrenoId, actor);

		// 4. Validar que el propietario exista y pertenezca al usuario
		await this.accessService.obtenerPropietario(dto.propietarioId, actor);

		const fechaNacimiento = new Date(dto.fechaNacimiento);

		// 5. Validar padre y madre (acceso, sexo, edad mínima reproductiva)
		await this.linajeService.validarPadres({
			fechaNacimientoCria: fechaNacimiento,
			padreId: dto.padreId ?? null,
			madreId: dto.madreId ?? null,
			actor,
		});

		// 6. Subir imagen si se proporcionó
		let imagenGanadoPath: string | null = null;
		if (dto.imagenGanado && dto.imagenGanado instanceof File) {
			imagenGanadoPath = await this.imageStorageService.upload(
				dto.imagenGanado,
				"ganados",
			);
		}

		// 7. Instanciar y persistir
		const ganado = Ganado.create(
			dto.identificador,
			dto.peso,
			fechaNacimiento,
			dto.sexo,
			imagenGanadoPath,
			dto.razaId,
			dto.terrenoId,
			dto.propietarioId,
			dto.padreId ?? null,
			dto.madreId ?? null,
		);

		const saved = await this.ganadoRepository.save(ganado);
		return this.mapper.toDto(saved);
	}
}
