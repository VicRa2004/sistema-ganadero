import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarLotesUseCase } from "../../../application/useCases/ListarLotesUseCase";
import { listarLotesQuerySchema } from "../schemas/LoteSchemas";

@injectable()
export class ListarLotesController extends BaseController {
	constructor(
		@inject("ListarLotesUseCase")
		private readonly useCase: ListarLotesUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const query = validate(listarLotesQuerySchema, c.req.query());
			const result = await this.useCase.run(query, this.getActor(c));
			return this.ok(c, result);
		});
	};
}
