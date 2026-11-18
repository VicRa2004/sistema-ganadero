import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ObtenerCalendarioSanitarioUseCase } from "../../../application/useCases/ObtenerCalendarioSanitarioUseCase";
import { calendarioQuerySchema } from "../schemas/sesionSanitariaSchema";

@injectable()
export class ObtenerCalendarioSanitarioController extends BaseController {
	constructor(
		@inject("ObtenerCalendarioSanitarioUseCase")
		private readonly useCase: ObtenerCalendarioSanitarioUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const query = validate(calendarioQuerySchema, c.req.query());
			const result = await this.useCase.run(query, this.getActor(c));
			return this.ok(c, result);
		});
	};
}
