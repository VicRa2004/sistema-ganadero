import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarPropietariosUseCase } from "../../../application/useCases/ListarPropietariosUseCase";
import { listarPropietariosQuerySchema } from "../schemas/PropietarioSchemas";

@injectable()
export class ListarPropietariosController extends BaseController {
	constructor(
		@inject("ListarPropietariosUseCase")
		private readonly listarUseCase: ListarPropietariosUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const queryParams = c.req.query();
			const filters = validate(listarPropietariosQuerySchema, queryParams);

			const result = await this.listarUseCase.run(filters);
			return this.ok(c, result);
		});
	};
}
