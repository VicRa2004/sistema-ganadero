import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ConsumirInsumoUseCase } from "../../../application/useCases/ConsumirInsumoUseCase";
import { consumirInsumoSchema, insumoIdSchema } from "../schemas/InsumoSchemas";

@injectable()
export class ConsumirInsumoController extends BaseController {
	constructor(
		@inject("ConsumirInsumoUseCase")
		private readonly consumirInsumoUseCase: ConsumirInsumoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(insumoIdSchema, { id: c.req.param("id") });
			const body = await c.req.json();
			const dto = validate(consumirInsumoSchema, body);

			const result = await this.consumirInsumoUseCase.run(id, dto);
			return this.ok(c, result);
		});
	};
}
