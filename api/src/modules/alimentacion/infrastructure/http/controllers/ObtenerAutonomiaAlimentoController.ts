import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ObtenerAutonomiaAlimentoUseCase } from "../../../application/useCases/ObtenerAutonomiaAlimentoUseCase";

@injectable()
export class ObtenerAutonomiaAlimentoController extends BaseController {
	constructor(
		@inject("ObtenerAutonomiaAlimentoUseCase")
		private readonly useCase: ObtenerAutonomiaAlimentoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const result = await this.useCase.run(this.getActor(c));
			return this.ok(c, result);
		});
	};
}
