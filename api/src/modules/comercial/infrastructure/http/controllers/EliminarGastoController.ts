import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { EliminarGastoUseCase } from "../../../application/useCases/EliminarGastoUseCase";
import { comercialIdParamSchema } from "../schemas/ComercialSchemas";

@injectable()
export class EliminarGastoController extends BaseController {
	constructor(
		@inject("EliminarGastoUseCase")
		private readonly useCase: EliminarGastoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(comercialIdParamSchema, c.req.param());
			await this.useCase.run(id, this.getActor(c));
			return this.ok(c, { success: true });
		});
	};
}
