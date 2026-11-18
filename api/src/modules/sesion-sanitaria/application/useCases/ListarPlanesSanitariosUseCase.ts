import { inject, injectable } from "tsyringe";
import { type Actor, usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import type { PlanSanitarioRepository } from "../../domain/repository/PlanSanitarioRepository";
import type { PlanSanitarioOutputDto } from "../dtos/PlanSanitarioDto";
import type { PlanSanitarioMapper } from "../mappers/PlanSanitarioMapper";

@injectable()
export class ListarPlanesSanitariosUseCase {
	constructor(
		@inject("PlanSanitarioRepository")
		private readonly planRepository: PlanSanitarioRepository,
		@inject("PlanSanitarioMapper")
		private readonly mapper: PlanSanitarioMapper,
	) {}

	public async run(actor: Actor): Promise<PlanSanitarioOutputDto[]> {
		const planes = await this.planRepository.findByUsuario(
			usuarioIdDeFiltro(actor),
		);
		return planes.map((p) => this.mapper.toDto(p));
	}
}
