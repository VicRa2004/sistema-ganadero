import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { EliminarPropietarioUseCase } from "../../../application/useCases/EliminarPropietarioUseCase";
import { propietarioIdSchema } from "../schemas/PropietarioSchemas";

@injectable()
export class EliminarPropietarioController extends BaseController {
	constructor(
		@inject("EliminarPropietarioUseCase")
		private readonly eliminarUseCase: EliminarPropietarioUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(propietarioIdSchema, { id: c.req.param("id") });
			await this.eliminarUseCase.run(id);
			return this.ok(c, { success: true });
		});
	};
}
