import { inject, injectable } from "tsyringe";
import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { EliminarVeterinarioUseCase } from "../../../application/useCases/EliminarVeterinarioUseCase";
import { veterinarioIdSchema } from "../schemas/VeterinarioSchemas";

@injectable()
export class EliminarVeterinarioController extends BaseController {
	constructor(
		@inject("EliminarVeterinarioUseCase")
		private readonly eliminarUseCase: EliminarVeterinarioUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(veterinarioIdSchema, { id: c.req.param("id") });
			const user = c.get("user");
			await this.eliminarUseCase.run(id, user.id, user.role);
			return this.ok(c, { success: true });
		});
	};
}
