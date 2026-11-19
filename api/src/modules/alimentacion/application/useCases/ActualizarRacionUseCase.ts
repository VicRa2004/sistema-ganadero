import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { AlimentacionRepository } from "../../domain/repository/AlimentacionRepository";
import type {
	ActualizarRacionInputDto,
	RacionOutputDto,
} from "../dtos/AlimentacionDto";
import type { AlimentacionMapper } from "../mappers/AlimentacionMapper";
import type { AlimentacionAccessService } from "../services/AlimentacionAccessService";

@injectable()
export class ActualizarRacionUseCase {
	constructor(
		@inject("AlimentacionRepository")
		private readonly alimentacionRepository: AlimentacionRepository,
		@inject("AlimentacionAccessService")
		private readonly accessService: AlimentacionAccessService,
		@inject("AlimentacionMapper")
		private readonly mapper: AlimentacionMapper,
	) {}

	public async run(
		id: number,
		dto: ActualizarRacionInputDto,
		actor: Actor,
	): Promise<RacionOutputDto> {
		const racion = await this.accessService.obtenerRacion(id, actor);

		if (dto.insumoId !== undefined) {
			await this.accessService.obtenerInsumoAlimento(dto.insumoId, actor);
		}
		const nextTerrenoId =
			dto.terrenoId !== undefined ? dto.terrenoId : racion.getTerrenoId();
		const nextLoteId =
			dto.loteId !== undefined ? dto.loteId : racion.getLoteId();
		await this.accessService.validarDestino(nextTerrenoId, nextLoteId, actor);

		racion.actualizar(dto);
		const saved = await this.alimentacionRepository.saveRacion(racion);
		return this.mapper.racionToDto(saved);
	}
}
