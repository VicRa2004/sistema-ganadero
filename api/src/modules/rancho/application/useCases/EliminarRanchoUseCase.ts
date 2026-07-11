import { inject, injectable } from "tsyringe";
import { RanchoNotFoundError } from "../../domain/error/RanchoNotFoundError";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { RanchoRepository } from "../../domain/repository/RanchoRepository";

@injectable()
export class EliminarRanchoUseCase {
	constructor(
		@inject("RanchoRepository")
		private readonly ranchoRepository: RanchoRepository,
	) {}

	public async run(id: number, usuarioId: number, rol: string): Promise<void> {
		const rancho = await this.ranchoRepository.findById(id);
		if (!rancho) {
			throw new RanchoNotFoundError(id);
		}

		if (rol !== "ADMIN" && rancho.getUsuarioId() !== usuarioId) {
			throw new BaseError("No tienes permiso para acceder a este rancho", 403);
		}

		await this.ranchoRepository.delete(id);
	}
}
