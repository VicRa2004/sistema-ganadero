import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarPapeleraUseCase } from "../../../application/useCases/PapeleraUseCases";
import {
	listarPapeleraQuerySchema,
	tipoPapeleraSchema,
} from "../schemas/PapeleraSchemas";

@injectable()
export class ListarPapeleraController extends BaseController {
	constructor(
		@inject("ListarPapeleraUseCase")
		private readonly useCase: ListarPapeleraUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { tipo } = validate(tipoPapeleraSchema, c.req.param());
			const query = validate(listarPapeleraQuerySchema, c.req.query());
			return this.ok(c, await this.useCase.run(tipo, query, this.getActor(c)));
		});
	};
}
