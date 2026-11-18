import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarNotificacionesUseCase } from "../../../application/useCases/ListarNotificacionesUseCase";
import { listarNotificacionesQuerySchema } from "../schemas/NotificacionSchemas";

@injectable()
export class ListarNotificacionesController extends BaseController {
	constructor(
		@inject("ListarNotificacionesUseCase")
		private readonly useCase: ListarNotificacionesUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const actor = this.getActor(c);
			const query = validate(listarNotificacionesQuerySchema, c.req.query());
			const result = await this.useCase.run({
				...query,
				usuarioId: actor.id,
			});
			return this.ok(c, result);
		});
	};
}
