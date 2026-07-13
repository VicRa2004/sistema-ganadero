import { inject, injectable } from "tsyringe";
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
import type { TerrenoRepository } from "@/modules/terreno/domain/repository/TerrenoRepository";
import type { PropietarioRepository } from "@/modules/propietario/domain/repository/PropietarioRepository";

// Errores externos
import { RazaNotFoundError } from "@/modules/raza/domain/error/RazaNotFoundError";
import { TerrenoNotFoundError } from "@/modules/terreno/domain/error/TerrenoNotFoundError";
import { PropietarioNotFoundError } from "@/modules/propietario/domain/error/PropietarioNotFoundError";
import { GanadoNotFoundError } from "../../domain/error/GanadoNotFoundError";

@injectable()
export class RegistrarGanadoUseCase {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("RazaRepository")
		private readonly razaRepository: RazaRepository,
		@inject("TerrenoRepository")
		private readonly terrenoRepository: TerrenoRepository,
		@inject("PropietarioRepository")
		private readonly propietarioRepository: PropietarioRepository,
		@inject("GanadoMapper")
		private readonly mapper: GanadoMapper,
		@inject("ImageStorageService")
		private readonly imageStorageService: ImageStorageService,
	) {}

	public async run(dto: RegistrarGanadoInputDto): Promise<GanadoOutputDto> {
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

		// 3. Validar que el terreno exista
		const terreno = await this.terrenoRepository.findById(dto.terrenoId);
		if (!terreno) {
			throw new TerrenoNotFoundError(dto.terrenoId);
		}

		// 4. Validar que el propietario exista
		const propietario = await this.propietarioRepository.findById(
			dto.propietarioId,
		);
		if (!propietario) {
			throw new PropietarioNotFoundError(dto.propietarioId);
		}

		// 5. Validar padre si se proporcionó
		if (dto.padreId) {
			const padre = await this.ganadoRepository.findById(dto.padreId);
			if (!padre) {
				throw new GanadoNotFoundError(dto.padreId);
			}
		}

		// 6. Validar madre si se proporcionó
		if (dto.madreId) {
			const madre = await this.ganadoRepository.findById(dto.madreId);
			if (!madre) {
				throw new GanadoNotFoundError(dto.madreId);
			}
		}

		// 7. Subir imagen si se proporcionó
		let imagenGanadoPath: string | null = null;
		if (dto.imagenGanado && dto.imagenGanado instanceof File) {
			imagenGanadoPath = await this.imageStorageService.upload(
				dto.imagenGanado,
				"ganados",
			);
		}

		// 8. Instanciar y persistir
		const fechaNacimiento = new Date(dto.fechaNacimiento);
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
