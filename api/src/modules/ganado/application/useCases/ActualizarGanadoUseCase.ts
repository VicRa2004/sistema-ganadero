import { inject, injectable } from "tsyringe";
import type { ImageStorageService } from "@/core/shared/domain/services/ImageStorageService";
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
import type { TerrenoRepository } from "@/modules/terreno/domain/repository/TerrenoRepository";
import type { PropietarioRepository } from "@/modules/propietario/domain/repository/PropietarioRepository";

// Errores externos
import { RazaNotFoundError } from "@/modules/raza/domain/error/RazaNotFoundError";
import { TerrenoNotFoundError } from "@/modules/terreno/domain/error/TerrenoNotFoundError";
import { PropietarioNotFoundError } from "@/modules/propietario/domain/error/PropietarioNotFoundError";

@injectable()
export class ActualizarGanadoUseCase {
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

	public async run(
		id: number,
		dto: ActualizarGanadoInputDto,
	): Promise<GanadoOutputDto> {
		// 1. Validar que el ganado exista
		const ganado = await this.ganadoRepository.findById(id);
		if (!ganado) {
			throw new GanadoNotFoundError(id);
		}

		// Determinar valores finales
		const nuevoIdentificador = dto.identificador ?? ganado.getIdentificador();
		const nuevoPeso = dto.peso ?? ganado.getPeso();
		const nuevaFechaNacimiento = dto.fechaNacimiento
			? new Date(dto.fechaNacimiento)
			: ganado.getFechaNacimiento();
		const nuevoSexo = dto.sexo ?? ganado.getSexo();
		const nuevaRazaId = dto.razaId ?? ganado.getRazaId();
		const nuevoTerrenoId = dto.terrenoId ?? ganado.getTerrenoId();
		const nuevoPropietarioId = dto.propietarioId ?? ganado.getPropietarioId();
		const nuevoPadreId =
			dto.padreId !== undefined ? dto.padreId : ganado.getPadreId();
		const nuevaMadreId =
			dto.madreId !== undefined ? dto.madreId : ganado.getMadreId();

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

		// 4. Validar que el terreno exista si se cambió
		if (dto.terrenoId && dto.terrenoId !== ganado.getTerrenoId()) {
			const terreno = await this.terrenoRepository.findById(dto.terrenoId);
			if (!terreno) {
				throw new TerrenoNotFoundError(dto.terrenoId);
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

		// 6. Validar padre si se actualizó
		if (nuevoPadreId && nuevoPadreId !== ganado.getPadreId()) {
			const padre = await this.ganadoRepository.findById(nuevoPadreId);
			if (!padre) {
				throw new GanadoNotFoundError(nuevoPadreId);
			}
		}

		// 7. Validar madre si se actualizó
		if (nuevaMadreId && nuevaMadreId !== ganado.getMadreId()) {
			const madre = await this.ganadoRepository.findById(nuevaMadreId);
			if (!madre) {
				throw new GanadoNotFoundError(nuevaMadreId);
			}
		}

		// 8. Manejar imagen
		if (dto.imagenGanado && dto.imagenGanado instanceof File) {
			// Eliminar imagen anterior si existe
			const imagenAnterior = ganado.getImagenGanado();
			if (imagenAnterior) {
				try {
					await this.imageStorageService.delete(imagenAnterior);
				} catch {
					// No falla si la imagen anterior no existe
				}
			}
			const nuevaRuta = await this.imageStorageService.upload(
				dto.imagenGanado,
				"ganados",
			);
			ganado.setImagenGanado(nuevaRuta);
		}

		// 9. Actualizar modelo de dominio
		ganado.actualizar(
			nuevoIdentificador,
			nuevoPeso,
			nuevaFechaNacimiento,
			nuevoSexo,
			nuevaRazaId,
			nuevoTerrenoId,
			nuevoPropietarioId,
			nuevoPadreId,
			nuevaMadreId,
		);

		// 10. Guardar cambios
		const saved = await this.ganadoRepository.save(ganado);
		return this.mapper.toDto(saved);
	}
}
