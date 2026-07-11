import { inject, injectable } from "tsyringe";
import { GanadoDuplicateIdentificadorError } from "../../domain/error/GanadoDuplicateIdentificadorError";
import { GanadoNotFoundError } from "../../domain/error/GanadoNotFoundError";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";
import type {
	ActualizarGanadoInputDto,
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
export class ActualizarGanadoUseCase {
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

	public async run(
		id: number,
		dto: ActualizarGanadoInputDto,
	): Promise<GanadoOutputDto> {
		// 1. Validar que el ganado exista
		const ganado = await this.ganadoRepository.findById(id);
		if (!ganado) {
			throw new GanadoNotFoundError(id);
		}

		// Determinar valores finales (si no se envían, usar los existentes)
		const nuevoIdentificador = dto.identificador ?? ganado.getIdentificador();
		const nuevoPeso = dto.peso ?? ganado.getPeso();
		const nuevaEdadEnMeses = dto.edadEnMeses ?? ganado.getEdadEnMeses();
		const nuevoSexo = dto.sexo ?? ganado.getSexo();
		const nuevaRazaId = dto.razaId ?? ganado.getRazaId();
		const nuevoRanchoId = dto.ranchoId ?? ganado.getRanchoId();
		const nuevoPropietarioId = dto.propietarioId ?? ganado.getPropietarioId();

		// 2. Validar que el identificador no esté duplicado en otro ganado
		if (dto.identificador && dto.identificador !== ganado.getIdentificador()) {
			const existing = await this.ganadoRepository.findByIdentificador(
				dto.identificador,
			);
			if (existing && existing.getId() !== id) {
				throw new GanadoDuplicateIdentificadorError(dto.identificador);
			}
		}

		// 3. Validar que la raza exista si se cambió
		if (dto.razaId && dto.razaId !== ganado.getRazaId()) {
			const raza = await this.razaRepository.findById(dto.razaId);
			if (!raza) {
				throw new RazaNotFoundError(dto.razaId);
			}
		}

		// 4. Validar que el rancho exista si se cambió
		if (dto.ranchoId && dto.ranchoId !== ganado.getRanchoId()) {
			const rancho = await this.ranchoRepository.findById(dto.ranchoId);
			if (!rancho) {
				throw new RanchoNotFoundError(dto.ranchoId);
			}
		}

		// 5. Validar que el propietario exista si se cambió
		if (dto.propietarioId && dto.propietarioId !== ganado.getPropietarioId()) {
			const propietario = await this.propietarioRepository.findById(
				dto.propietarioId,
			);
			if (!propietario) {
				throw new PropietarioNotFoundError(dto.propietarioId);
			}
		}

		// 6. Actualizar modelo de dominio
		ganado.actualizar(
			nuevoIdentificador,
			nuevoPeso,
			nuevaEdadEnMeses,
			nuevoSexo,
			nuevaRazaId,
			nuevoRanchoId,
			nuevoPropietarioId,
		);

		// 7. Guardar cambios
		const saved = await this.ganadoRepository.save(ganado);
		return this.mapper.toDto(saved);
	}
}
