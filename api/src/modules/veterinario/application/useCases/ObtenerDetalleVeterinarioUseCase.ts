import { inject, injectable } from "tsyringe";
import { VeterinarioNotFoundError } from "../../domain/error/VeterinarioNotFoundError";
import type { VeterinarioRepository } from "../../domain/repository/VeterinarioRepository";
import type { VeterinarioOutputDto } from "../dtos/VeterinarioDto";
import type { VeterinarioMapper } from "../mappers/VeterinarioMapper";

@injectable()
export class ObtenerDetalleVeterinarioUseCase {
	constructor(
		@inject("VeterinarioRepository")
		private readonly repository: VeterinarioRepository,
		@inject("VeterinarioMapper")
		private readonly mapper: VeterinarioMapper,
	) {}

	public async run(id: number): Promise<VeterinarioOutputDto> {
		const veterinario = await this.repository.findById(id);
		if (!veterinario) {
			throw new VeterinarioNotFoundError(id);
		}
		return this.mapper.toDto(veterinario);
	}
}
