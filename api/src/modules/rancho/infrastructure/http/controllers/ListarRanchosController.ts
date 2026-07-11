import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarRanchosUseCase } from "../../../application/useCases/ListarRanchosUseCase";
import { listarRanchosQuerySchema } from "../schemas/RanchoSchemas";

@injectable()
export class ListarRanchosController extends BaseController {
	constructor(
		@inject("ListarRanchosUseCase")
		private readonly listarRanchosUseCase: ListarRanchosUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const query = c.req.query();
			const dto = validate(listarRanchosQuerySchema, query);
			const user = c.get("user");
			const filters = {
				...dto,
				usuarioId: user.role !== "ADMIN" ? user.id : undefined,
			};
			const result = await this.listarRanchosUseCase.run(filters);
			return this.ok(c, result);
		});
	};
}
