import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { LoteRepository } from "../../domain/repository/LoteRepository";
import type { ActualizarLoteInputDto, LoteOutputDto } from "../dtos/LoteDto";
import type { LoteMapper } from "../mappers/LoteMapper";
import type { LoteAccessService } from "../services/LoteAccessService";

@injectable()
export class ActualizarLoteUseCase {
	constructor(
		@inject("LoteRepository")
		private readonly loteRepository: LoteRepository,
		@inject("LoteAccessService")
		private readonly accessService: LoteAccessService,
		@inject("LoteMapper")
		private readonly mapper: LoteMapper,
	) {}

	public async run(
		id: number,
		dto: ActualizarLoteInputDto,
		actor: Actor,
	): Promise<LoteOutputDto> {
		const lote = await this.accessService.obtenerLote(id, actor);
		if (dto.terrenoId) {
			await this.accessService.validarTerreno(dto.terrenoId, actor);
		}
		lote.actualizar(dto);
		const saved = await this.loteRepository.save(lote);
		return this.mapper.toDto(saved);
	}
}
