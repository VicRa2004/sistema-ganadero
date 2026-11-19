import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { EliminarTransaccionUseCase } from "../../../application/useCases/EliminarTransaccionUseCase";
import { comercialIdParamSchema } from "../schemas/ComercialSchemas";

@injectable()
export class EliminarTransaccionController extends BaseController {
	constructor(
		@inject("EliminarTransaccionUseCase")
		private readonly useCase: EliminarTransaccionUseCase,
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
