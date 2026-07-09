import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { AbastecerInsumoUseCase } from "../../../application/useCases/AbastecerInsumoUseCase";
import {
	abastecerInsumoSchema,
	insumoIdSchema,
} from "../schemas/InsumoSchemas";

@injectable()
export class AbastecerInsumoController extends BaseController {
	constructor(
		@inject("AbastecerInsumoUseCase")
		private readonly abastecerInsumoUseCase: AbastecerInsumoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(insumoIdSchema, { id: c.req.param("id") });
			const body = await c.req.json();
			const dto = validate(abastecerInsumoSchema, body);

			const result = await this.abastecerInsumoUseCase.run(id, dto);
			return this.ok(c, result);
		});
	};
}
