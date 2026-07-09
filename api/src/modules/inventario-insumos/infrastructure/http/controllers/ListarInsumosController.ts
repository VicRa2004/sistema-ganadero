import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarInsumosUseCase } from "../../../application/useCases/ListarInsumosUseCase";
import { listarInsumosQuerySchema } from "../schemas/InsumoSchemas";

@injectable()
export class ListarInsumosController extends BaseController {
	constructor(
		@inject("ListarInsumosUseCase")
		private readonly listarInsumosUseCase: ListarInsumosUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const queryParams = c.req.query();
			const filters = validate(listarInsumosQuerySchema, queryParams);

			const result = await this.listarInsumosUseCase.run(filters);
			return this.ok(c, result);
		});
	};
}
