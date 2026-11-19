import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { CrearRacionUseCase } from "../../../application/useCases/CrearRacionUseCase";
import { crearRacionSchema } from "../schemas/AlimentacionSchemas";

@injectable()
export class CrearRacionController extends BaseController {
	constructor(
		@inject("CrearRacionUseCase")
		private readonly useCase: CrearRacionUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const dto = validate(crearRacionSchema, body);
			const result = await this.useCase.run(dto, this.getActor(c));
			return this.created(c, result);
		});
	};
}
