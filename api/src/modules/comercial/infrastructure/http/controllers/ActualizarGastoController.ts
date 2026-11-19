import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ActualizarGastoUseCase } from "../../../application/useCases/ActualizarGastoUseCase";
import {
	actualizarGastoSchema,
	comercialIdParamSchema,
} from "../schemas/ComercialSchemas";

@injectable()
export class ActualizarGastoController extends BaseController {
	constructor(
		@inject("ActualizarGastoUseCase")
		private readonly useCase: ActualizarGastoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(comercialIdParamSchema, c.req.param());
			const body = await c.req.json();
			const dto = validate(actualizarGastoSchema, body);
			const result = await this.useCase.run(id, dto, this.getActor(c));
			return this.ok(c, result);
		});
	};
}
