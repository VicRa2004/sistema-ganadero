import { inject, injectable } from "tsyringe";
import { Veterinario } from "../../domain/Veterinario";
import { VeterinarioDuplicateCedulaError } from "../../domain/error/VeterinarioDuplicateCedulaError";
import type { VeterinarioRepository } from "../../domain/repository/VeterinarioRepository";
import type {
	RegistrarVeterinarioInputDto,
	VeterinarioOutputDto,
} from "../dtos/VeterinarioDto";
import type { VeterinarioMapper } from "../mappers/VeterinarioMapper";

@injectable()
export class RegistrarVeterinarioUseCase {
	constructor(
		@inject("VeterinarioRepository")
		private readonly repository: VeterinarioRepository,
		@inject("VeterinarioMapper")
		private readonly mapper: VeterinarioMapper,
	) {}

	public async run(
		dto: RegistrarVeterinarioInputDto,
	): Promise<VeterinarioOutputDto> {
		const existing = await this.repository.findByCedula(dto.cedulaProfesional);
		if (existing) {
			throw new VeterinarioDuplicateCedulaError(dto.cedulaProfesional);
		}

		const veterinario = Veterinario.create(
			dto.nombre,
			dto.telefono,
			dto.cedulaProfesional,
			dto.usuarioId,
			dto.especialidad ?? null,
		);

		const saved = await this.repository.save(veterinario);
		return this.mapper.toDto(saved);
	}
}
