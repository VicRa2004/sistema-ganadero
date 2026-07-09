import { inject, injectable } from "tsyringe";
import { RazaDuplicateNameError } from "../../domain/error/RazaDuplicateNameError";
import { RazaNotFoundError } from "../../domain/error/RazaNotFoundError";
import type { RazaRepository } from "../../domain/repository/RazaRepository";
import type { RazaOutputDto, UpdateRazaInputDto } from "../dtos/RazaDto";
import type { RazaMapper } from "../mappers/RazaMapper";

@injectable()
export class UpdateRazaUseCase {
	constructor(
		@inject("RazaRepository")
		private readonly razaRepository: RazaRepository,
		@inject("RazaMapper")
		private readonly mapper: RazaMapper,
	) {}

	public async run(
		id: number,
		dto: UpdateRazaInputDto,
	): Promise<RazaOutputDto> {
		const raza = await this.razaRepository.findById(id);
		if (!raza) {
			throw new RazaNotFoundError(id);
		}

		if (dto.nombre && dto.nombre !== raza.getNombre()) {
			const existingRaza = await this.razaRepository.findByName(dto.nombre);
			if (existingRaza && existingRaza.getId() !== id) {
				throw new RazaDuplicateNameError(dto.nombre);
			}
		}

		const nuevoNombre = dto.nombre ?? raza.getNombre();
		const nuevaDescripcion =
			dto.descripcion !== undefined ? dto.descripcion : raza.getDescripcion();

		raza.actualizar(nuevoNombre, nuevaDescripcion);
		const updatedRaza = await this.razaRepository.save(raza);

		return this.mapper.toDto(updatedRaza);
	}
}
