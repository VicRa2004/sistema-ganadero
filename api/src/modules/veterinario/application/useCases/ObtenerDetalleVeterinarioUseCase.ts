import { inject, injectable } from "tsyringe";
import { assertPuedeAcceder } from "@/core/shared/domain/Actor";
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

	public async run(
		id: number,
		usuarioId: number,
		rol: string,
	): Promise<VeterinarioOutputDto> {
		const veterinario = await this.repository.findById(id);
		if (!veterinario) {
			throw new VeterinarioNotFoundError(id);
		}

		assertPuedeAcceder(
			{ id: usuarioId, role: rol },
			veterinario.getUsuarioId(),
			"No tienes permiso para acceder a este veterinario",
		);

		return this.mapper.toDto(veterinario);
	}
}
