import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { RegisterRazaUseCase } from "../../../application/useCases/RegisterRazaUseCase";
import { createRazaSchema } from "../schemas/RazaSchemas";

@injectable()
export class RegisterRazaController extends BaseController {
	constructor(
		@inject("RegisterRazaUseCase")
		private readonly registerRazaUseCase: RegisterRazaUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const dto = validate(createRazaSchema, body);

			const result = await this.registerRazaUseCase.run(dto);
			return this.created(c, result);
		});
	};
}
