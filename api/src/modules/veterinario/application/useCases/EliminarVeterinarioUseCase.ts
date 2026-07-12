import { inject, injectable } from "tsyringe";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { VeterinarioNotFoundError } from "../../domain/error/VeterinarioNotFoundError";
import type { VeterinarioRepository } from "../../domain/repository/VeterinarioRepository";

@injectable()
export class EliminarVeterinarioUseCase {
	constructor(
		@inject("VeterinarioRepository")
		private readonly repository: VeterinarioRepository,
	) {}

	public async run(id: number, usuarioId: number, rol: string): Promise<void> {
		const veterinario = await this.repository.findById(id);
		if (!veterinario) {
			throw new VeterinarioNotFoundError(id);
		}

		if (rol !== "ADMIN" && veterinario.getUsuarioId() !== usuarioId) {
			throw new BaseError(
				"No tienes permiso para eliminar este veterinario",
				403,
			);
		}

		await this.repository.delete(id);
	}
}
