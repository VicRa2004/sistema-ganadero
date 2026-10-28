import { inject, injectable } from "tsyringe";
import { assertPuedeAcceder } from "@/core/shared/domain/Actor";
import { TerrenoNotFoundError } from "../../domain/error/TerrenoNotFoundError";
import type { TerrenoRepository } from "../../domain/repository/TerrenoRepository";
import type { TerrenoOutputDto } from "../dtos/TerrenoDto";
import type { TerrenoMapper } from "../mappers/TerrenoMapper";

@injectable()
export class ObtenerDetalleTerrenoUseCase {
	constructor(
		@inject("TerrenoRepository")
		private readonly terrenoRepository: TerrenoRepository,
		@inject("TerrenoMapper")
		private readonly mapper: TerrenoMapper,
	) {}

	public async run(
		id: number,
		usuarioId: number,
		rol: string,
	): Promise<TerrenoOutputDto> {
		const terreno = await this.terrenoRepository.findById(id);
		if (!terreno) {
			throw new TerrenoNotFoundError(id);
		}

		assertPuedeAcceder(
			{ id: usuarioId, role: rol },
			terreno.getUsuarioId(),
			"No tienes permiso para acceder a este terreno",
		);

		return this.mapper.toDto(terreno);
	}
}
