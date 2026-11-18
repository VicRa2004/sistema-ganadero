import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { MarcarNotificacionLeidaUseCase } from "../../../application/useCases/MarcarNotificacionLeidaUseCase";
import { notificacionIdSchema } from "../schemas/NotificacionSchemas";

@injectable()
export class MarcarNotificacionLeidaController extends BaseController {
	constructor(
		@inject("MarcarNotificacionLeidaUseCase")
		private readonly useCase: MarcarNotificacionLeidaUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const actor = this.getActor(c);
			const { id } = validate(notificacionIdSchema, { id: c.req.param("id") });
			const result = await this.useCase.run(id, actor.id);
			return this.ok(c, result);
		});
	};
}
