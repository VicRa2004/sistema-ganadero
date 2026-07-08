import { inject, injectable } from "tsyringe";
import { PropietarioNotFoundError } from "../../domain/error/PropietarioNotFoundError";
import type { PropietarioRepository } from "../../domain/repository/PropietarioRepository";

@injectable()
export class EliminarPropietarioUseCase {
	constructor(
		@inject("PropietarioRepository")
		private readonly propietarioRepository: PropietarioRepository,
	) {}

	public async run(id: number): Promise<void> {
		const propietario = await this.propietarioRepository.findById(id);
		if (!propietario) {
			throw new PropietarioNotFoundError(id);
		}
		await this.propietarioRepository.delete(id);
	}
}
