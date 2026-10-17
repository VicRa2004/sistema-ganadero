import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import type { GanadoAccessService } from "../services/GanadoAccessService";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";
import type { GanadoOutputDto } from "../dtos/GanadoDto";
import type { GanadoMapper } from "../mappers/GanadoMapper";

@injectable()
export class RegistrarPesajeUseCase {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
		@inject("GanadoAccessService")
		private readonly accessService: GanadoAccessService,
		@inject("GanadoMapper")
		private readonly mapper: GanadoMapper,
	) {}

	public async run(
		id: number,
		input: { peso: number; fecha?: Date; observaciones?: string },
		actor: Actor,
	): Promise<GanadoOutputDto> {
		const ganado = await this.accessService.obtenerGanado(id, actor);

		// Valida el peso con las reglas del dominio
		ganado.registrarPesaje(input.peso);

		const fecha = input.fecha ?? new Date();
		if (fecha.getTime() > Date.now()) {
			throw new ValidationError("La fecha del pesaje no puede ser futura");
		}
		if (fecha < ganado.getFechaNacimiento()) {
			throw new ValidationError(
				"La fecha del pesaje no puede ser anterior al nacimiento",
			);
		}

		const saved = await this.ganadoRepository.registrarPesaje(id, {
			peso: input.peso,
			fecha,
			observaciones: input.observaciones ?? null,
		});
		return this.mapper.toDto(saved);
	}
}
