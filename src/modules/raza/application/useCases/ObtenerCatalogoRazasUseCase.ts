import { inject, injectable } from "tsyringe";
import type { RazaRepository } from "../../domain/repository/RazaRepository";
import type { RazaOutputDto } from "../dtos/RazaDto";
import type { RazaMapper } from "../mappers/RazaMapper";

@injectable()
export class ObtenerCatalogoRazasUseCase {
	constructor(
		@inject("RazaRepository")
		private readonly razaRepository: RazaRepository,
		@inject("RazaMapper")
		private readonly mapper: RazaMapper,
	) {}

	public async run(): Promise<RazaOutputDto[]> {
		const razas = await this.razaRepository.findAll();
		return razas.map((raza) => this.mapper.toDto(raza));
	}
}
