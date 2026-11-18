import { inject, injectable } from "tsyringe";
import { type Actor, assertPuedeAcceder } from "@/core/shared/domain/Actor";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { TerrenoRepository } from "@/modules/terreno/domain/repository/TerrenoRepository";
import { PlanSanitario } from "../../domain/PlanSanitario";
import type { PlanSanitarioRepository } from "../../domain/repository/PlanSanitarioRepository";
import type {
	CrearPlanSanitarioInputDto,
	PlanSanitarioOutputDto,
} from "../dtos/PlanSanitarioDto";
import type { PlanSanitarioMapper } from "../mappers/PlanSanitarioMapper";
import type { SesionAccessService } from "../services/SesionAccessService";

@injectable()
export class CrearPlanSanitarioUseCase {
	constructor(
		@inject("PlanSanitarioRepository")
		private readonly planRepository: PlanSanitarioRepository,
		@inject("SesionAccessService")
		private readonly accessService: SesionAccessService,
		@inject("TerrenoRepository")
		private readonly terrenoRepository: TerrenoRepository,
		@inject("PlanSanitarioMapper")
		private readonly mapper: PlanSanitarioMapper,
	) {}

	public async run(
		dto: CrearPlanSanitarioInputDto,
		actor: Actor,
	): Promise<PlanSanitarioOutputDto> {
		await this.accessService.obtenerVeterinario(dto.veterinarioId, actor);
		await this.accessService.obtenerInsumo(dto.insumoId, actor);

		if (dto.terrenoId) {
			const terreno = await this.terrenoRepository.findById(dto.terrenoId);
			if (!terreno) {
				throw new BaseError(
					`Terreno con ID ${dto.terrenoId} no encontrado`,
					404,
				);
			}
			assertPuedeAcceder(
				actor,
				terreno.getUsuarioId(),
				"No tienes permiso para usar este terreno",
			);
		}

		const plan = PlanSanitario.create(
			dto.nombre,
			dto.descripcion,
			dto.frecuenciaDias,
			dto.dosisPorAnimal,
			dto.veterinarioId,
			dto.insumoId,
			new Date(dto.proximaEjecucion),
			actor.id,
			{
				terrenoId: dto.terrenoId ?? null,
				razaId: dto.razaId ?? null,
				edadMinimaMeses: dto.edadMinimaMeses ?? null,
				activo: dto.activo ?? true,
			},
		);

		const saved = await this.planRepository.save(plan);
		return this.mapper.toDto(saved);
	}
}
