import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { CrearLoteUseCase } from "../../../application/useCases/CrearLoteUseCase";
import { crearLoteSchema } from "../schemas/LoteSchemas";

@injectable()
export class CrearLoteController extends BaseController {
	constructor(
		@inject("CrearLoteUseCase")
		private readonly useCase: CrearLoteUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const dto = validate(crearLoteSchema, body);
			const result = await this.useCase.run(dto, this.getActor(c));
			return this.created(c, result);
		});
	};
}
