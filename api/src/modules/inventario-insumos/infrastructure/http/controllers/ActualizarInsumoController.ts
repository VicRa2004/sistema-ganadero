import { inject, injectable } from "tsyringe";
import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ActualizarInsumoUseCase } from "../../../application/useCases/ActualizarInsumoUseCase";
import { actualizarInsumoSchema } from "../schemas/InsumoSchemas";

@injectable()
export class ActualizarInsumoController extends BaseController {
	constructor(
		@inject("ActualizarInsumoUseCase")
		private readonly actualizarInsumoUseCase: ActualizarInsumoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const id = Number(c.req.param("id"));
			const body = await c.req.json();
			const parsed = actualizarInsumoSchema.parse(body);

			const result = await this.actualizarInsumoUseCase.run(id, parsed);
			return this.ok(c, result);
		});
	};
}
