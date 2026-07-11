import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { EliminarRanchoUseCase } from "../../../application/useCases/EliminarRanchoUseCase";
import { ranchoIdSchema } from "../schemas/RanchoSchemas";

@injectable()
export class EliminarRanchoController extends BaseController {
	constructor(
		@inject("EliminarRanchoUseCase")
		private readonly eliminarRanchoUseCase: EliminarRanchoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const { id } = validate(ranchoIdSchema, { id: idParam });
			const user = c.get("user");

			await this.eliminarRanchoUseCase.run(id, user.id, user.role);
			return this.ok(c, { success: true });
		});
	};
}
