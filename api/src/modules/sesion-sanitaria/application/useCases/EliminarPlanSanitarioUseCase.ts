import { inject, injectable } from "tsyringe";
import { type Actor, assertPuedeAcceder } from "@/core/shared/domain/Actor";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { PlanSanitarioRepository } from "../../domain/repository/PlanSanitarioRepository";

@injectable()
export class EliminarPlanSanitarioUseCase {
	constructor(
		@inject("PlanSanitarioRepository")
		private readonly planRepository: PlanSanitarioRepository,
	) {}

	public async run(id: number, actor: Actor): Promise<void> {
		const plan = await this.planRepository.findById(id);
		if (!plan) {
			throw new BaseError(`Plan sanitario con ID ${id} no encontrado`, 404);
		}
		assertPuedeAcceder(
			actor,
			plan.getUsuarioId(),
			"No tienes permiso para eliminar este plan sanitario",
		);
		await this.planRepository.delete(id);
	}
}
