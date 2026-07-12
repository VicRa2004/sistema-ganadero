import { inject, injectable } from "tsyringe";
import { BaseError } from "@/core/shared/domain/error/BaseError";
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

		if (rol !== "ADMIN" && veterinario.getUsuarioId() !== usuarioId) {
			throw new BaseError(
				"No tienes permiso para acceder a este veterinario",
				403,
			);
		}

		return this.mapper.toDto(veterinario);
	}
}
