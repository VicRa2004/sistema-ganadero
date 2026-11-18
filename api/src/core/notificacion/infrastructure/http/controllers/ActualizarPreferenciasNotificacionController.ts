import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ActualizarPreferenciasNotificacionUseCase } from "../../../application/useCases/ActualizarPreferenciasNotificacionUseCase";
import { actualizarPreferenciasSchema } from "../schemas/NotificacionSchemas";

@injectable()
export class ActualizarPreferenciasNotificacionController extends BaseController {
	constructor(
		@inject("ActualizarPreferenciasNotificacionUseCase")
		private readonly useCase: ActualizarPreferenciasNotificacionUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const actor = this.getActor(c);
			const body = validate(actualizarPreferenciasSchema, await c.req.json());
			const result = await this.useCase.run(actor.id, body.preferencias);
			return this.ok(c, result);
		});
	};
}
