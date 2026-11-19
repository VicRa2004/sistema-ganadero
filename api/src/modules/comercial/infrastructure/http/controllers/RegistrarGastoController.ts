import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { RegistrarGastoUseCase } from "../../../application/useCases/RegistrarGastoUseCase";
import { registrarGastoSchema } from "../schemas/ComercialSchemas";

@injectable()
export class RegistrarGastoController extends BaseController {
	constructor(
		@inject("RegistrarGastoUseCase")
		private readonly useCase: RegistrarGastoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const dto = validate(registrarGastoSchema, body);
			const result = await this.useCase.run(dto, this.getActor(c));
			return this.created(c, result);
		});
	};
}
