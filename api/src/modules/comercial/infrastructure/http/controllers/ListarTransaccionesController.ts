import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarTransaccionesUseCase } from "../../../application/useCases/ListarTransaccionesUseCase";
import { listarTransaccionesQuerySchema } from "../schemas/ComercialSchemas";

@injectable()
export class ListarTransaccionesController extends BaseController {
	constructor(
		@inject("ListarTransaccionesUseCase")
		private readonly useCase: ListarTransaccionesUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const q = validate(listarTransaccionesQuerySchema, c.req.query());
			const result = await this.useCase.run(
				{
					page: q.page,
					limit: q.limit,
					tipo: q.tipo,
					desde: q.desde ? new Date(q.desde) : undefined,
					hasta: q.hasta ? new Date(q.hasta) : undefined,
				},
				this.getActor(c),
			);
			return this.ok(c, result);
		});
	};
}
