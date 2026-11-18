import { inject, injectable } from "tsyringe";
import { type Actor, assertPuedeAcceder } from "@/core/shared/domain/Actor";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { PlanSanitarioRepository } from "../../domain/repository/PlanSanitarioRepository";
import type {
	ActualizarPlanSanitarioInputDto,
	PlanSanitarioOutputDto,
} from "../dtos/PlanSanitarioDto";
import type { PlanSanitarioMapper } from "../mappers/PlanSanitarioMapper";
import type { SesionAccessService } from "../services/SesionAccessService";

@injectable()
export class ActualizarPlanSanitarioUseCase {
	constructor(
		@inject("PlanSanitarioRepository")
		private readonly planRepository: PlanSanitarioRepository,
		@inject("SesionAccessService")
		private readonly accessService: SesionAccessService,
		@inject("PlanSanitarioMapper")
		private readonly mapper: PlanSanitarioMapper,
	) {}

	public async run(
		id: number,
		dto: ActualizarPlanSanitarioInputDto,
		actor: Actor,
	): Promise<PlanSanitarioOutputDto> {
		const plan = await this.planRepository.findById(id);
		if (!plan) {
			throw new BaseError(`Plan sanitario con ID ${id} no encontrado`, 404);
		}
		assertPuedeAcceder(
			actor,
			plan.getUsuarioId(),
			"No tienes permiso para modificar este plan sanitario",
		);

		if (dto.veterinarioId) {
			await this.accessService.obtenerVeterinario(dto.veterinarioId, actor);
		}
		if (dto.insumoId) {
			await this.accessService.obtenerInsumo(dto.insumoId, actor);
		}

		plan.actualizar({
			nombre: dto.nombre,
			descripcion: dto.descripcion,
			frecuenciaDias: dto.frecuenciaDias,
			dosisPorAnimal: dto.dosisPorAnimal,
			veterinarioId: dto.veterinarioId,
			insumoId: dto.insumoId,
			terrenoId: dto.terrenoId,
			razaId: dto.razaId,
			edadMinimaMeses: dto.edadMinimaMeses,
			proximaEjecucion: dto.proximaEjecucion
				? new Date(dto.proximaEjecucion)
				: undefined,
			activo: dto.activo,
		});

		const updated = await this.planRepository.save(plan);
		return this.mapper.toDto(updated);
	}
}
