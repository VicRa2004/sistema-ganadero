import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarTrasladosUseCase } from "../../../application/useCases/ListarTrasladosUseCase";
import { ganadoIdSchema } from "../schemas/GanadoSchemas";

@injectable()
export class ListarTrasladosController extends BaseController {
	constructor(
		@inject("ListarTrasladosUseCase")
		private readonly listarTrasladosUseCase: ListarTrasladosUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(ganadoIdSchema, { id: c.req.param("id") });
			const result = await this.listarTrasladosUseCase.run(
				id,
				this.getActor(c),
			);
			return this.ok(c, result);
		});
	};
}
