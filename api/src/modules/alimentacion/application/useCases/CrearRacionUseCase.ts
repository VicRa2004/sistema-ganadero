import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { RacionAlimentacion } from "../../domain/RacionAlimentacion";
import type { AlimentacionRepository } from "../../domain/repository/AlimentacionRepository";
import type {
	CrearRacionInputDto,
	RacionOutputDto,
} from "../dtos/AlimentacionDto";
import type { AlimentacionMapper } from "../mappers/AlimentacionMapper";
import type { AlimentacionAccessService } from "../services/AlimentacionAccessService";

@injectable()
export class CrearRacionUseCase {
	constructor(
		@inject("AlimentacionRepository")
		private readonly alimentacionRepository: AlimentacionRepository,
		@inject("AlimentacionAccessService")
		private readonly accessService: AlimentacionAccessService,
		@inject("AlimentacionMapper")
		private readonly mapper: AlimentacionMapper,
	) {}

	public async run(
		dto: CrearRacionInputDto,
		actor: Actor,
	): Promise<RacionOutputDto> {
		await this.accessService.obtenerInsumoAlimento(dto.insumoId, actor);
		await this.accessService.validarDestino(dto.terrenoId, dto.loteId, actor);

		const racion = RacionAlimentacion.create({
			nombre: dto.nombre,
			insumoId: dto.insumoId,
			terrenoId: dto.terrenoId ?? null,
			loteId: dto.loteId ?? null,
			cantidadDiariaPorAnimal: dto.cantidadDiariaPorAnimal,
			diasAlertaAutonomia: dto.diasAlertaAutonomia,
			activo: dto.activo,
			observaciones: dto.observaciones,
			usuarioId: actor.id,
		});

		const saved = await this.alimentacionRepository.saveRacion(racion);
		return this.mapper.racionToDto(saved);
	}
}
