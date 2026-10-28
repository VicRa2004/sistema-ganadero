import { inject, injectable } from "tsyringe";
import { assertPuedeAcceder } from "@/core/shared/domain/Actor";
import { InsumoNotFoundError } from "../../domain/error/InsumoNotFoundError";
import type { InsumoRepository } from "../../domain/repository/InsumoRepository";

@injectable()
export class EliminarInsumoUseCase {
	constructor(
		@inject("InsumoRepository")
		private readonly insumoRepository: InsumoRepository,
	) {}

	public async run(id: number, usuarioId: number, rol: string): Promise<void> {
		const insumo = await this.insumoRepository.findById(id);
		if (!insumo) {
			throw new InsumoNotFoundError(id);
		}

		assertPuedeAcceder(
			{ id: usuarioId, role: rol },
			insumo.getUsuarioId(),
			"No tienes permiso para eliminar este insumo",
		);
		await this.insumoRepository.delete(id);
	}
}
