import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { LoteRepository } from "../../domain/repository/LoteRepository";
import type { LoteDetalleOutputDto } from "../dtos/LoteDto";
import type { LoteMapper } from "../mappers/LoteMapper";
import type { LoteAccessService } from "../services/LoteAccessService";

@injectable()
export class QuitarMiembroLoteUseCase {
	constructor(
		@inject("LoteRepository")
		private readonly loteRepository: LoteRepository,
		@inject("LoteAccessService")
		private readonly accessService: LoteAccessService,
		@inject("LoteMapper")
		private readonly mapper: LoteMapper,
	) {}

	public async run(
		loteId: number,
		ganadoId: number,
		actor: Actor,
	): Promise<LoteDetalleOutputDto> {
		await this.accessService.obtenerLote(loteId, actor);
		await this.loteRepository.removeMember(loteId, ganadoId);
		const detail = await this.accessService.obtenerDetalle(loteId, actor);
		return this.mapper.toDetalleDto(detail);
	}
}
