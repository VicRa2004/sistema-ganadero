import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarKardexInsumoUseCase } from "../../../application/useCases/ListarKardexInsumoUseCase";
import {
	insumoIdSchema,
	listarKardexQuerySchema,
} from "../schemas/InsumoSchemas";

@injectable()
export class ListarKardexInsumoController extends BaseController {
	constructor(
		@inject("ListarKardexInsumoUseCase")
		private readonly useCase: ListarKardexInsumoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(insumoIdSchema, { id: c.req.param("id") });
			const query = validate(listarKardexQuerySchema, c.req.query());
			const user = c.get("user");

			const result = await this.useCase.run(
				id,
				{
					page: query.page,
					limit: query.limit,
					tipo: query.tipo,
					desde: query.desde ? new Date(query.desde) : undefined,
					hasta: query.hasta ? new Date(query.hasta) : undefined,
				},
				{ id: user.id, role: user.role },
			);
			return this.ok(c, result);
		});
	};
}
