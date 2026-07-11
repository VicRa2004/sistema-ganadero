import { inject, injectable } from "tsyringe";
import { Rancho } from "../../domain/Rancho";
import type { RanchoRepository } from "../../domain/repository/RanchoRepository";
import type {
	RegistrarRanchoInputDto,
	RanchoOutputDto,
} from "../dtos/RanchoDto";
import type { RanchoMapper } from "../mappers/RanchoMapper";

@injectable()
export class RegistrarRanchoUseCase {
	constructor(
		@inject("RanchoRepository")
		private readonly ranchoRepository: RanchoRepository,
		@inject("RanchoMapper")
		private readonly mapper: RanchoMapper,
	) {}

	public async run(dto: RegistrarRanchoInputDto): Promise<RanchoOutputDto> {
		const rancho = Rancho.create(
			dto.nombre,
			dto.ubicacion,
			dto.extensionHectareas,
			dto.capacidadMaxima,
			dto.usuarioId,
		);

		const saved = await this.ranchoRepository.save(rancho);
		return this.mapper.toDto(saved);
	}
}
