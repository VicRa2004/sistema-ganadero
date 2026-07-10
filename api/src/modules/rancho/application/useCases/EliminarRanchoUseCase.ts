import { inject, injectable } from "tsyringe";
import { RanchoNotFoundError } from "../../domain/error/RanchoNotFoundError";
import type { RanchoRepository } from "../../domain/repository/RanchoRepository";

@injectable()
export class EliminarRanchoUseCase {
	constructor(
		@inject("RanchoRepository")
		private readonly ranchoRepository: RanchoRepository,
	) {}

	public async run(id: number): Promise<void> {
		const rancho = await this.ranchoRepository.findById(id);
		if (!rancho) {
			throw new RanchoNotFoundError(id);
		}
		await this.ranchoRepository.delete(id);
	}
}
