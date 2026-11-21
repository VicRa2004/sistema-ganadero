import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarAuditoriaUseCase } from "../../../application/useCases/ListarAuditoriaUseCase";
import { listarAuditoriaQuerySchema } from "../schemas/AuditoriaSchemas";

@injectable()
export class ListarAuditoriaController extends BaseController {
	constructor(
		@inject("ListarAuditoriaUseCase")
		private readonly useCase: ListarAuditoriaUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const filters = validate(listarAuditoriaQuerySchema, c.req.query());
			return this.ok(c, await this.useCase.run(filters));
		});
	};
}
