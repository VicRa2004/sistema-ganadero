import { inject, injectable } from "tsyringe";
import { Raza } from "../../domain/Raza";
import { RazaDuplicateNameError } from "../../domain/error/RazaDuplicateNameError";
import type { RazaRepository } from "../../domain/repository/RazaRepository";
import type { RazaOutputDto, RegisterRazaInputDto } from "../dtos/RazaDto";
import type { RazaMapper } from "../mappers/RazaMapper";

@injectable()
export class RegisterRazaUseCase {
	constructor(
		@inject("RazaRepository")
		private readonly razaRepository: RazaRepository,
		@inject("RazaMapper")
		private readonly mapper: RazaMapper,
	) {}

	public async run(dto: RegisterRazaInputDto): Promise<RazaOutputDto> {
		const existingRaza = await this.razaRepository.findByName(dto.nombre);
		if (existingRaza) {
			throw new RazaDuplicateNameError(dto.nombre);
		}

		const raza = Raza.create(dto.nombre, dto.descripcion);
		const savedRaza = await this.razaRepository.save(raza);

		return this.mapper.toDto(savedRaza);
	}
}
