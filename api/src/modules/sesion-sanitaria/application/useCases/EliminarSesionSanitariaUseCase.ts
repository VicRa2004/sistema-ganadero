import { inject, injectable } from "tsyringe";
import { SesionSanitariaNotFoundError } from "../../domain/error/SesionSanitariaNotFoundError";
import type { SesionSanitariaRepository } from "../../domain/repository/SesionSanitariaRepository";

@injectable()
export class EliminarSesionSanitariaUseCase {
	constructor(
		@inject("SesionSanitariaRepository")
		private readonly sesionSanitariaRepository: SesionSanitariaRepository,
	) {}

	public async run(id: number): Promise<void> {
		const sesion = await this.sesionSanitariaRepository.findById(id);
		if (!sesion) {
			throw new SesionSanitariaNotFoundError(id);
		}

		await this.sesionSanitariaRepository.delete(id);
	}
}
