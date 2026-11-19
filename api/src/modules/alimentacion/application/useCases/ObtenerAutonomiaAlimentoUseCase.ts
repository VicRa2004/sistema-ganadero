import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { AutonomiaAlimentoDto } from "../dtos/AlimentacionDto";
import type { AutonomiaAlimentoQuery } from "../queries/AutonomiaAlimentoQuery";

@injectable()
export class ObtenerAutonomiaAlimentoUseCase {
	constructor(
		@inject("AutonomiaAlimentoQuery")
		private readonly query: AutonomiaAlimentoQuery,
	) {}

	public async run(actor: Actor): Promise<AutonomiaAlimentoDto[]> {
		return this.query.obtenerAutonomia(actor);
	}
}
