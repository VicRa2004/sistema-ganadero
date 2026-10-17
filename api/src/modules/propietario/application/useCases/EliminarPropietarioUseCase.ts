import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { puedeAcceder } from "@/core/shared/domain/Actor";
import { PropietarioNotFoundError } from "../../domain/error/PropietarioNotFoundError";
import type { PropietarioRepository } from "../../domain/repository/PropietarioRepository";

@injectable()
export class EliminarPropietarioUseCase {
	constructor(
		@inject("PropietarioRepository")
		private readonly propietarioRepository: PropietarioRepository,
	) {}

	public async run(id: number, actor: Actor): Promise<void> {
		const propietario = await this.propietarioRepository.findById(id);
		if (!propietario || !puedeAcceder(actor, propietario.getUsuarioId())) {
			throw new PropietarioNotFoundError(id);
		}
		await this.propietarioRepository.delete(id);
	}
}
