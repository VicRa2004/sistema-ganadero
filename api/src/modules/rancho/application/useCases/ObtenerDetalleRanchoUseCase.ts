import { inject, injectable } from "tsyringe";
import { RanchoNotFoundError } from "../../domain/error/RanchoNotFoundError";
import type { RanchoRepository } from "../../domain/repository/RanchoRepository";
import type { RanchoOutputDto } from "../dtos/RanchoDto";
import type { RanchoMapper } from "../mappers/RanchoMapper";

@injectable()
export class ObtenerDetalleRanchoUseCase {
	constructor(
		@inject("RanchoRepository")
		private readonly ranchoRepository: RanchoRepository,
		@inject("RanchoMapper")
		private readonly mapper: RanchoMapper,
	) {}

	public async run(id: number): Promise<RanchoOutputDto> {
		const rancho = await this.ranchoRepository.findById(id);
		if (!rancho) {
			throw new RanchoNotFoundError(id);
		}
		return this.mapper.toDto(rancho);
	}
}
