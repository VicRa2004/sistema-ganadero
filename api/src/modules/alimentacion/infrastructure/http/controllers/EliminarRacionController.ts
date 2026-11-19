import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { EliminarRacionUseCase } from "../../../application/useCases/EliminarRacionUseCase";
import { racionIdParamSchema } from "../schemas/AlimentacionSchemas";

@injectable()
export class EliminarRacionController extends BaseController {
	constructor(
		@inject("EliminarRacionUseCase")
		private readonly useCase: EliminarRacionUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(racionIdParamSchema, { id: c.req.param("id") });
			await this.useCase.run(id, this.getActor(c));
			return this.ok(c, { success: true });
		});
	};
}
