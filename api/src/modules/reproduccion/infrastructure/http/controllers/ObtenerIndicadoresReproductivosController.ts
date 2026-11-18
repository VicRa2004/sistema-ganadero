import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ObtenerIndicadoresReproductivosUseCase } from "../../../application/useCases/ObtenerIndicadoresReproductivosUseCase";
import { indicadoresReproductivosQuerySchema } from "../schemas/ReproduccionSchemas";

@injectable()
export class ObtenerIndicadoresReproductivosController extends BaseController {
	constructor(
		@inject("ObtenerIndicadoresReproductivosUseCase")
		private readonly useCase: ObtenerIndicadoresReproductivosUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const query = validate(
				indicadoresReproductivosQuerySchema,
				c.req.query(),
			);
			const result = await this.useCase.run(
				{
					desde: query.desde ? new Date(query.desde) : undefined,
					hasta: query.hasta ? new Date(query.hasta) : undefined,
				},
				this.getActor(c),
			);
			return this.ok(c, result);
		});
	};
}
