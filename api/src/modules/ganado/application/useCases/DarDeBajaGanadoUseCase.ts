import { inject, injectable } from "tsyringe";
import { GanadoNotFoundError } from "../../domain/error/GanadoNotFoundError";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";
import type { MotivoBajaRepository } from "../../domain/repository/MotivoBajaRepository";
import type {
	DarDeBajaGanadoInputDto,
	GanadoOutputDto,
} from "../dtos/GanadoDto";
import type { GanadoMapper } from "../mappers/GanadoMapper";
import { BaseError } from "@/core/shared/domain/error/BaseError";

class MotivoBajaNotFoundError extends BaseError {
	constructor(id: number) {
		super(`Motivo de baja con ID ${id} no fue encontrado`, 404);
	}
}

class GanadoYaDadoDeBajaError extends BaseError {
	constructor(id: number) {
		super(`El ganado con ID ${id} ya se encuentra dado de baja`, 400);
	}
}

@injectable()
export class DarDeBajaGanadoUseCase {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("MotivoBajaRepository")
		private readonly motivoBajaRepository: MotivoBajaRepository,
		@inject("GanadoMapper")
		private readonly mapper: GanadoMapper,
	) {}

	public async run(
		id: number,
		dto: DarDeBajaGanadoInputDto,
	): Promise<GanadoOutputDto> {
		// 1. Validar que el ganado exista
		const ganado = await this.ganadoRepository.findById(id);
		if (!ganado) {
			throw new GanadoNotFoundError(id);
		}

		// 2. Validar que no esté ya dado de baja
		if (!ganado.estaActivo()) {
			throw new GanadoYaDadoDeBajaError(id);
		}

		// 3. Validar que el motivo de baja exista
		const motivo = await this.motivoBajaRepository.findById(dto.motivoBajaId);
		if (!motivo) {
			throw new MotivoBajaNotFoundError(dto.motivoBajaId);
		}

		// 4. Aplicar baja en el dominio
		const fechaBaja = new Date(dto.fechaBaja);
		ganado.darDeBaja(fechaBaja, dto.motivoBajaId);

		// 5. Persistir
		const saved = await this.ganadoRepository.save(ganado);
		return this.mapper.toDto(saved);
	}
}
