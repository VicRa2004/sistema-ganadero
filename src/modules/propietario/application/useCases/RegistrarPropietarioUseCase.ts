import { inject, injectable } from "tsyringe";
import { Propietario } from "../../domain/Propietario";
import { PropietarioDuplicateEmailError } from "../../domain/error/PropietarioDuplicateEmailError";
import type { PropietarioRepository } from "../../domain/repository/PropietarioRepository";
import type {
	RegistrarPropietarioInputDto,
	PropietarioOutputDto,
} from "../dtos/PropietarioDto";
import type { PropietarioMapper } from "../mappers/PropietarioMapper";

@injectable()
export class RegistrarPropietarioUseCase {
	constructor(
		@inject("PropietarioRepository")
		private readonly propietarioRepository: PropietarioRepository,
		@inject("PropietarioMapper")
		private readonly mapper: PropietarioMapper,
	) {}

	public async run(
		dto: RegistrarPropietarioInputDto,
	): Promise<PropietarioOutputDto> {
		if (dto.correo && dto.correo.trim() !== "") {
			const existing = await this.propietarioRepository.findByEmail(dto.correo);
			if (existing) {
				throw new PropietarioDuplicateEmailError(dto.correo);
			}
		}

		const propietario = Propietario.create(
			dto.nombre,
			dto.telefono ?? null,
			dto.correo ?? null,
		);

		const saved = await this.propietarioRepository.save(propietario);
		return this.mapper.toDto(saved);
	}
}
