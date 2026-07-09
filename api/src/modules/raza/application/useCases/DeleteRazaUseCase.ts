import { inject, injectable } from "tsyringe";
import { RazaNotFoundError } from "../../domain/error/RazaNotFoundError";
import type { RazaRepository } from "../../domain/repository/RazaRepository";

@injectable()
export class DeleteRazaUseCase {
	constructor(
		@inject("RazaRepository")
		private readonly razaRepository: RazaRepository,
	) {}

	public async run(id: number): Promise<void> {
		const raza = await this.razaRepository.findById(id);
		if (!raza) {
			throw new RazaNotFoundError(id);
		}

		await this.razaRepository.delete(id);
	}
}
