import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ActualizarRacionUseCase } from "../../../application/useCases/ActualizarRacionUseCase";
import {
	actualizarRacionSchema,
	racionIdParamSchema,
} from "../schemas/AlimentacionSchemas";

@injectable()
export class ActualizarRacionController extends BaseController {
	constructor(
		@inject("ActualizarRacionUseCase")
		private readonly useCase: ActualizarRacionUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(racionIdParamSchema, { id: c.req.param("id") });
			const body = await c.req.json();
			const dto = validate(actualizarRacionSchema, body);
			const result = await this.useCase.run(id, dto, this.getActor(c));
			return this.ok(c, result);
		});
	};
}
