import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { GanadoAccessService } from "../services/GanadoAccessService";
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
		@inject("GanadoAccessService")
		private readonly accessService: GanadoAccessService,
		@inject("GanadoMapper")
		private readonly mapper: GanadoMapper,
	) {}

	public async run(
		id: number,
		dto: DarDeBajaGanadoInputDto,
		actor: Actor,
	): Promise<GanadoOutputDto> {
		// 1. Validar que el ganado exista y pertenezca al usuario
		const ganado = await this.accessService.obtenerGanado(id, actor);

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
