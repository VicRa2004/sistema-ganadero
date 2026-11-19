import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarGastosUseCase } from "../../../application/useCases/ListarGastosUseCase";
import { listarGastosQuerySchema } from "../schemas/ComercialSchemas";

@injectable()
export class ListarGastosController extends BaseController {
	constructor(
		@inject("ListarGastosUseCase")
		private readonly useCase: ListarGastosUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const q = validate(listarGastosQuerySchema, c.req.query());
			const result = await this.useCase.run(
				{
					page: q.page,
					limit: q.limit,
					categoria: q.categoria,
					terrenoId: q.terrenoId,
					ganadoId: q.ganadoId,
					loteId: q.loteId,
					desde: q.desde ? new Date(q.desde) : undefined,
					hasta: q.hasta ? new Date(q.hasta) : undefined,
				},
				this.getActor(c),
			);
			return this.ok(c, result);
		});
	};
}
