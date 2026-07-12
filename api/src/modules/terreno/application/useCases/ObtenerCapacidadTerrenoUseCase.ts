import { inject, injectable } from "tsyringe";
import { TerrenoNotFoundError } from "../../domain/error/TerrenoNotFoundError";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { TerrenoRepository } from "../../domain/repository/TerrenoRepository";
import type { TerrenoCapacidadOutputDto } from "../dtos/TerrenoDto";

@injectable()
export class ObtenerCapacidadTerrenoUseCase {
	constructor(
		@inject("TerrenoRepository")
		private readonly terrenoRepository: TerrenoRepository,
	) {}

	public async run(
		id: number,
		usuarioId: number,
		rol: string,
	): Promise<TerrenoCapacidadOutputDto> {
		const terreno = await this.terrenoRepository.findById(id);
		if (!terreno) {
			throw new TerrenoNotFoundError(id);
		}

		if (rol !== "ADMIN" && terreno.getUsuarioId() !== usuarioId) {
			throw new BaseError("No tienes permiso para acceder a este terreno", 403);
		}

		const cabezasGanadoActuales =
			await this.terrenoRepository.countGanadoByRanchoId(id);
		const espacioDisponible =
			terreno.getCapacidadMaxima() - cabezasGanadoActuales;

		return {
			id: terreno.getId(),
			nombre: terreno.getNombre(),
			capacidadMaxima: terreno.getCapacidadMaxima(),
			cabezasGanadoActuales,
			espacioDisponible,
		};
	}
}
