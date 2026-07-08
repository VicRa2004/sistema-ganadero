import { inject, injectable } from "tsyringe";
import { PropietarioDuplicateEmailError } from "../../domain/error/PropietarioDuplicateEmailError";
import { PropietarioNotFoundError } from "../../domain/error/PropietarioNotFoundError";
import type { PropietarioRepository } from "../../domain/repository/PropietarioRepository";
import type {
	ActualizarPropietarioInputDto,
	PropietarioOutputDto,
} from "../dtos/PropietarioDto";
import type { PropietarioMapper } from "../mappers/PropietarioMapper";

@injectable()
export class ActualizarDatosPropietarioUseCase {
	constructor(
		@inject("PropietarioRepository")
		private readonly propietarioRepository: PropietarioRepository,
		@inject("PropietarioMapper")
		private readonly mapper: PropietarioMapper,
	) {}

	public async run(
		id: number,
		dto: ActualizarPropietarioInputDto,
	): Promise<PropietarioOutputDto> {
		const propietario = await this.propietarioRepository.findById(id);
		if (!propietario) {
			throw new PropietarioNotFoundError(id);
		}

		if (dto.correo !== undefined && dto.correo !== propietario.getCorreo()) {
			if (dto.correo && dto.correo.trim() !== "") {
				const existing = await this.propietarioRepository.findByEmail(
					dto.correo,
				);
				if (existing && existing.getId() !== id) {
					throw new PropietarioDuplicateEmailError(dto.correo);
				}
			}
		}

		const nombre =
			dto.nombre !== undefined ? dto.nombre : propietario.getNombre();
		const telefono =
			dto.telefono !== undefined ? dto.telefono : propietario.getTelefono();
		const correo =
			dto.correo !== undefined ? dto.correo : propietario.getCorreo();

		propietario.actualizar(nombre, telefono, correo);

		const updated = await this.propietarioRepository.save(propietario);
		return this.mapper.toDto(updated);
	}
}
