import { inject, injectable } from "tsyringe";
import { TerrenoNotFoundError } from "../../domain/error/TerrenoNotFoundError";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { TerrenoRepository } from "../../domain/repository/TerrenoRepository";

@injectable()
export class EliminarTerrenoUseCase {
	constructor(
		@inject("TerrenoRepository")
		private readonly terrenoRepository: TerrenoRepository,
	) {}

	public async run(id: number, usuarioId: number, rol: string): Promise<void> {
		const terreno = await this.terrenoRepository.findById(id);
		if (!terreno) {
			throw new TerrenoNotFoundError(id);
		}

		if (rol !== "ADMIN" && terreno.getUsuarioId() !== usuarioId) {
			throw new BaseError("No tienes permiso para acceder a este terreno", 403);
		}

		await this.terrenoRepository.delete(id);
	}
}
