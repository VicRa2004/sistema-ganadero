import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { LoteDetalleOutputDto } from "../dtos/LoteDto";
import type { LoteMapper } from "../mappers/LoteMapper";
import type { LoteAccessService } from "../services/LoteAccessService";

@injectable()
export class ObtenerDetalleLoteUseCase {
	constructor(
		@inject("LoteAccessService")
		private readonly accessService: LoteAccessService,
		@inject("LoteMapper")
		private readonly mapper: LoteMapper,
	) {}

	public async run(id: number, actor: Actor): Promise<LoteDetalleOutputDto> {
		const detail = await this.accessService.obtenerDetalle(id, actor);
		return this.mapper.toDetalleDto(detail);
	}
}
