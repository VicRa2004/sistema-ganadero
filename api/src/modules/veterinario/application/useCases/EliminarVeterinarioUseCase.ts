import { inject, injectable } from "tsyringe";
import { assertPuedeAcceder } from "@/core/shared/domain/Actor";
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

		assertPuedeAcceder(
			{ id: usuarioId, role: rol },
			veterinario.getUsuarioId(),
			"No tienes permiso para eliminar este veterinario",
		);

		await this.repository.delete(id);
	}
}
