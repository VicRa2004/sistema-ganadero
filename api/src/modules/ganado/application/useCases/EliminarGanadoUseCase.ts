import { inject, injectable } from "tsyringe";
import { GanadoNotFoundError } from "../../domain/error/GanadoNotFoundError";
import type { GanadoRepository } from "../../domain/repository/GanadoRepository";

@injectable()
export class EliminarGanadoUseCase {
	constructor(
		@inject("GanadoRepository")
		private readonly ganadoRepository: GanadoRepository,
	) {}

	public async run(id: number): Promise<void> {
		const ganado = await this.ganadoRepository.findById(id);
		if (!ganado) {
			throw new GanadoNotFoundError(id);
		}
		await this.ganadoRepository.delete(id);
	}
}
