import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarRacionesUseCase } from "../../../application/useCases/ListarRacionesUseCase";
import { listarRacionesQuerySchema } from "../schemas/AlimentacionSchemas";

@injectable()
export class ListarRacionesController extends BaseController {
	constructor(
		@inject("ListarRacionesUseCase")
		private readonly useCase: ListarRacionesUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const query = validate(listarRacionesQuerySchema, c.req.query());
			const result = await this.useCase.run(query, this.getActor(c));
			return this.ok(c, result);
		});
	};
}
