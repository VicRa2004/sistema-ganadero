import { inject, injectable } from "tsyringe";
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
import type { RanchoRepository } from "@/modules/rancho/domain/repository/RanchoRepository";
import type { PropietarioRepository } from "@/modules/propietario/domain/repository/PropietarioRepository";

// Errores externos
import { RazaNotFoundError } from "@/modules/raza/domain/error/RazaNotFoundError";
import { RanchoNotFoundError } from "@/modules/rancho/domain/error/RanchoNotFoundError";
import { PropietarioNotFoundError } from "@/modules/propietario/domain/error/PropietarioNotFoundError";

@injectable()
export class RegistrarGanadoUseCase {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("RazaRepository")
		private readonly razaRepository: RazaRepository,
		@inject("RanchoRepository")
		private readonly ranchoRepository: RanchoRepository,
		@inject("PropietarioRepository")
		private readonly propietarioRepository: PropietarioRepository,
		@inject("GanadoMapper")
		private readonly mapper: GanadoMapper,
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

		// 3. Validar que el rancho exista
		const rancho = await this.ranchoRepository.findById(dto.ranchoId);
		if (!rancho) {
			throw new RanchoNotFoundError(dto.ranchoId);
		}

		// 4. Validar que el propietario exista
		const propietario = await this.propietarioRepository.findById(
			dto.propietarioId,
		);
		if (!propietario) {
			throw new PropietarioNotFoundError(dto.propietarioId);
		}

		// 5. Instanciar y persistir
		const ganado = Ganado.create(
			dto.identificador,
			dto.peso,
			dto.edadEnMeses,
			dto.sexo,
			dto.razaId,
			dto.ranchoId,
			dto.propietarioId,
		);

		const saved = await this.ganadoRepository.save(ganado);
		return this.mapper.toDto(saved);
	}
}
