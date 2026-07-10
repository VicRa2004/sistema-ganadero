import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ActualizarRanchoUseCase } from "../../../application/useCases/ActualizarRanchoUseCase";
import { updateRanchoSchema, ranchoIdSchema } from "../schemas/RanchoSchemas";

@injectable()
export class ActualizarRanchoController extends BaseController {
	constructor(
		@inject("ActualizarRanchoUseCase")
		private readonly actualizarRanchoUseCase: ActualizarRanchoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const { id } = validate(ranchoIdSchema, { id: idParam });

			const body = await c.req.json();
			const dto = validate(updateRanchoSchema, body);

			const result = await this.actualizarRanchoUseCase.run(id, dto);
			return this.ok(c, result);
		});
	};
}
