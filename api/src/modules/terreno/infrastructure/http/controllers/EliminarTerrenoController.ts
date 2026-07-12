import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { EliminarTerrenoUseCase } from "../../../application/useCases/EliminarTerrenoUseCase";
import { terrenoIdSchema } from "../schemas/TerrenoSchemas";

@injectable()
export class EliminarTerrenoController extends BaseController {
	constructor(
		@inject("EliminarTerrenoUseCase")
		private readonly eliminarTerrenoUseCase: EliminarTerrenoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const { id } = validate(terrenoIdSchema, { id: idParam });
			const user = c.get("user");

			await this.eliminarTerrenoUseCase.run(id, user.id, user.role);
			return this.ok(c, { success: true });
		});
	};
}
