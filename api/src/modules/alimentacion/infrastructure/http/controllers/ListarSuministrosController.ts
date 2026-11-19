import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarSuministrosUseCase } from "../../../application/useCases/ListarSuministrosUseCase";
import { listarSuministrosQuerySchema } from "../schemas/AlimentacionSchemas";

@injectable()
export class ListarSuministrosController extends BaseController {
	constructor(
		@inject("ListarSuministrosUseCase")
		private readonly useCase: ListarSuministrosUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const q = validate(listarSuministrosQuerySchema, c.req.query());
			const result = await this.useCase.run(
				{
					page: q.page,
					limit: q.limit,
					racionId: q.racionId,
					desde: q.desde ? new Date(q.desde) : undefined,
					hasta: q.hasta ? new Date(q.hasta) : undefined,
				},
				this.getActor(c),
			);
			return this.ok(c, result);
		});
	};
}
