import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarPesajesUseCase } from "../../../application/useCases/ListarPesajesUseCase";
import { ganadoIdSchema } from "../schemas/GanadoSchemas";

@injectable()
export class ListarPesajesController extends BaseController {
	constructor(
		@inject("ListarPesajesUseCase")
		private readonly listarPesajesUseCase: ListarPesajesUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(ganadoIdSchema, { id: c.req.param("id") });
			const result = await this.listarPesajesUseCase.run(id, this.getActor(c));
			return this.ok(c, result);
		});
	};
}
