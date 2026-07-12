import { inject, injectable } from "tsyringe";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { VeterinarioNotFoundError } from "../../domain/error/VeterinarioNotFoundError";
import { VeterinarioDuplicateCedulaError } from "../../domain/error/VeterinarioDuplicateCedulaError";
import type { VeterinarioRepository } from "../../domain/repository/VeterinarioRepository";
import type {
	ActualizarVeterinarioInputDto,
	VeterinarioOutputDto,
} from "../dtos/VeterinarioDto";
import type { VeterinarioMapper } from "../mappers/VeterinarioMapper";

@injectable()
export class ActualizarVeterinarioUseCase {
	constructor(
		@inject("VeterinarioRepository")
		private readonly repository: VeterinarioRepository,
		@inject("VeterinarioMapper")
		private readonly mapper: VeterinarioMapper,
	) {}

	public async run(
		id: number,
		dto: ActualizarVeterinarioInputDto,
		usuarioId: number,
		rol: string,
	): Promise<VeterinarioOutputDto> {
		const veterinario = await this.repository.findById(id);
		if (!veterinario) {
			throw new VeterinarioNotFoundError(id);
		}

		if (rol !== "ADMIN" && veterinario.getUsuarioId() !== usuarioId) {
			throw new BaseError(
				"No tienes permiso para actualizar este veterinario",
				403,
			);
		}

		const cedulaNueva =
			dto.cedulaProfesional ?? veterinario.getCedulaProfesional();
		if (cedulaNueva !== veterinario.getCedulaProfesional()) {
			const existing = await this.repository.findByCedula(cedulaNueva);
			if (existing) {
				throw new VeterinarioDuplicateCedulaError(cedulaNueva);
			}
		}

		veterinario.actualizar(
			dto.nombre ?? veterinario.getNombre(),
			dto.telefono ?? veterinario.getTelefono(),
			cedulaNueva,
			dto.especialidad !== undefined
				? dto.especialidad
				: veterinario.getEspecialidad(),
		);

		const saved = await this.repository.save(veterinario);
		return this.mapper.toDto(saved);
	}
}
