import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ObtenerGenealogiaUseCase } from "../../../application/useCases/ObtenerGenealogiaUseCase";
import {
	ganadoIdSchema,
	genealogiaQuerySchema,
} from "../schemas/GanadoSchemas";

@injectable()
export class ObtenerGenealogiaController extends BaseController {
	constructor(
		@inject("ObtenerGenealogiaUseCase")
		private readonly useCase: ObtenerGenealogiaUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(ganadoIdSchema, { id: c.req.param("id") });
			const { generaciones } = validate(genealogiaQuerySchema, c.req.query());
			const result = await this.useCase.run(id, generaciones, this.getActor(c));
			return this.ok(c, result);
		});
	};
}
