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
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { GanadoDetalleQuery } from "../queries/GanadoDetalleQuery";

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
		@inject("GanadoDetalleQuery")
		private readonly detalleQuery?: GanadoDetalleQuery,
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

		// 4. Bloquear venta/sacrificio si tiene período de retiro vigente
		const fechaBaja = new Date(dto.fechaBaja);
		const nombreMotivo =
			typeof motivo.getNombre === "function"
				? motivo.getNombre().toUpperCase()
				: "";
		if (
			this.detalleQuery &&
			(nombreMotivo === "VENTA" || nombreMotivo === "SACRIFICIO")
		) {
			const retiro = await this.detalleQuery.obtenerRetiroVigente(
				id,
				fechaBaja,
			);
			if (retiro.vigente && retiro.hasta) {
				const hastaStr = retiro.hasta.toISOString().slice(0, 10);
				throw new ValidationError(
					`No se puede dar de baja por ${nombreMotivo}: el animal tiene período de retiro vigente hasta ${hastaStr} (${retiro.motivo ?? "medicamento"})`,
				);
			}
		}

		// 5. Aplicar baja en el dominio
		ganado.darDeBaja(fechaBaja, dto.motivoBajaId);

		// 5. Persistir
		const saved = await this.ganadoRepository.save(ganado);
		return this.mapper.toDto(saved);
	}
}
