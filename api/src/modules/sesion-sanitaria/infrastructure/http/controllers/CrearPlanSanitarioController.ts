import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { CrearPlanSanitarioUseCase } from "../../../application/useCases/CrearPlanSanitarioUseCase";
import { crearPlanSanitarioSchema } from "../schemas/sesionSanitariaSchema";

@injectable()
export class CrearPlanSanitarioController extends BaseController {
	constructor(
		@inject("CrearPlanSanitarioUseCase")
		private readonly useCase: CrearPlanSanitarioUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = validate(crearPlanSanitarioSchema, await c.req.json());
			const result = await this.useCase.run(body, this.getActor(c));
			return this.created(c, result);
		});
	};
}
