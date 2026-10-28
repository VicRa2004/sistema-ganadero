import { inject, injectable } from "tsyringe";
import { assertPuedeAcceder } from "@/core/shared/domain/Actor";
import { TerrenoNotFoundError } from "../../domain/error/TerrenoNotFoundError";
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

		assertPuedeAcceder(
			{ id: usuarioId, role: rol },
			terreno.getUsuarioId(),
			"No tienes permiso para acceder a este terreno",
		);

		await this.terrenoRepository.delete(id);
	}
}
