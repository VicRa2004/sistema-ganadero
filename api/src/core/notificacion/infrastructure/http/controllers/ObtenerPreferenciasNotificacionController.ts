import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ObtenerPreferenciasNotificacionUseCase } from "../../../application/useCases/ObtenerPreferenciasNotificacionUseCase";

@injectable()
export class ObtenerPreferenciasNotificacionController extends BaseController {
	constructor(
		@inject("ObtenerPreferenciasNotificacionUseCase")
		private readonly useCase: ObtenerPreferenciasNotificacionUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const actor = this.getActor(c);
			const result = await this.useCase.run(actor.id);
			return this.ok(c, result);
		});
	};
}
