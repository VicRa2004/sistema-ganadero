import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { AjustarStockInsumoUseCase } from "../../../application/useCases/AjustarStockInsumoUseCase";
import {
	ajustarStockInsumoSchema,
	insumoIdSchema,
} from "../schemas/InsumoSchemas";

@injectable()
export class AjustarStockInsumoController extends BaseController {
	constructor(
		@inject("AjustarStockInsumoUseCase")
		private readonly useCase: AjustarStockInsumoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(insumoIdSchema, { id: c.req.param("id") });
			const body = await c.req.json();
			const dto = validate(ajustarStockInsumoSchema, body);
			const user = c.get("user");

			const result = await this.useCase.run(id, dto, {
				id: user.id,
				role: user.role,
			});
			return this.ok(c, result);
		});
	};
}
