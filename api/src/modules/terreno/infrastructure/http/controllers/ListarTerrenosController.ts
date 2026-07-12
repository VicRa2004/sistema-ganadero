import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarTerrenosUseCase } from "../../../application/useCases/ListarTerrenosUseCase";
import { listarTerrenosQuerySchema } from "../schemas/TerrenoSchemas";

@injectable()
export class ListarTerrenosController extends BaseController {
	constructor(
		@inject("ListarTerrenosUseCase")
		private readonly listarTerrenosUseCase: ListarTerrenosUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const query = c.req.query();
			const dto = validate(listarTerrenosQuerySchema, query);
			const user = c.get("user");
			const filters = {
				...dto,
				usuarioId: user.role !== "ADMIN" ? user.id : undefined,
			};
			const result = await this.listarTerrenosUseCase.run(filters);
			return this.ok(c, result);
		});
	};
}
