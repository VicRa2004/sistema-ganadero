import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ActualizarPlanSanitarioUseCase } from "../../../application/useCases/ActualizarPlanSanitarioUseCase";
import { actualizarPlanSanitarioSchema } from "../schemas/sesionSanitariaSchema";

@injectable()
export class ActualizarPlanSanitarioController extends BaseController {
	constructor(
		@inject("ActualizarPlanSanitarioUseCase")
		private readonly useCase: ActualizarPlanSanitarioUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const id = Number(c.req.param("id"));
			if (Number.isNaN(id) || id <= 0) {
				throw new BaseError("ID de plan inválido", 400);
			}
			const body = validate(actualizarPlanSanitarioSchema, await c.req.json());
			const result = await this.useCase.run(id, body, this.getActor(c));
			return this.ok(c, result);
		});
	};
}
