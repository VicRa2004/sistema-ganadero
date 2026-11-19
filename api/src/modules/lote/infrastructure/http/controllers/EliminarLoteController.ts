import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { EliminarLoteUseCase } from "../../../application/useCases/EliminarLoteUseCase";
import { loteIdParamSchema } from "../schemas/LoteSchemas";

@injectable()
export class EliminarLoteController extends BaseController {
	constructor(
		@inject("EliminarLoteUseCase")
		private readonly useCase: EliminarLoteUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(loteIdParamSchema, { id: c.req.param("id") });
			await this.useCase.run(id, this.getActor(c));
			return this.ok(c, { success: true });
		});
	};
}
