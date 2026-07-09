import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { RegistrarInsumoUseCase } from "../../../application/useCases/RegistrarInsumoUseCase";
import { registrarInsumoSchema } from "../schemas/InsumoSchemas";

@injectable()
export class RegistrarInsumoController extends BaseController {
	constructor(
		@inject("RegistrarInsumoUseCase")
		private readonly registrarInsumoUseCase: RegistrarInsumoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const dto = validate(registrarInsumoSchema, body);

			const result = await this.registrarInsumoUseCase.run(dto);
			return this.created(c, result);
		});
	};
}
