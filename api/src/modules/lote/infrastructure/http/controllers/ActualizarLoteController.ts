import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ActualizarLoteUseCase } from "../../../application/useCases/ActualizarLoteUseCase";
import {
	actualizarLoteSchema,
	loteIdParamSchema,
} from "../schemas/LoteSchemas";

@injectable()
export class ActualizarLoteController extends BaseController {
	constructor(
		@inject("ActualizarLoteUseCase")
		private readonly useCase: ActualizarLoteUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(loteIdParamSchema, { id: c.req.param("id") });
			const body = await c.req.json();
			const dto = validate(actualizarLoteSchema, body);
			const result = await this.useCase.run(id, dto, this.getActor(c));
			return this.ok(c, result);
		});
	};
}
