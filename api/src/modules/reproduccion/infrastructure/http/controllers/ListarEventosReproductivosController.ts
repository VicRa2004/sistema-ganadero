import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarEventosReproductivosUseCase } from "../../../application/useCases/ListarEventosReproductivosUseCase";
import { listarEventosReproductivosQuerySchema } from "../schemas/ReproduccionSchemas";

@injectable()
export class ListarEventosReproductivosController extends BaseController {
	constructor(
		@inject("ListarEventosReproductivosUseCase")
		private readonly useCase: ListarEventosReproductivosUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const query = validate(
				listarEventosReproductivosQuerySchema,
				c.req.query(),
			);
			const result = await this.useCase.run(
				{
					page: query.page,
					limit: query.limit,
					hembraId: query.hembraId,
					ganadoId: query.ganadoId,
					tipo: query.tipo,
					desde: query.desde ? new Date(query.desde) : undefined,
					hasta: query.hasta ? new Date(query.hasta) : undefined,
				},
				this.getActor(c),
			);
			return this.ok(c, result);
		});
	};
}
