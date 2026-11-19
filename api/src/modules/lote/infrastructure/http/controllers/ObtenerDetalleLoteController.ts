import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ObtenerDetalleLoteUseCase } from "../../../application/useCases/ObtenerDetalleLoteUseCase";
import { loteIdParamSchema } from "../schemas/LoteSchemas";

@injectable()
export class ObtenerDetalleLoteController extends BaseController {
	constructor(
		@inject("ObtenerDetalleLoteUseCase")
		private readonly useCase: ObtenerDetalleLoteUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(loteIdParamSchema, { id: c.req.param("id") });
			const result = await this.useCase.run(id, this.getActor(c));
			return this.ok(c, result);
		});
	};
}
