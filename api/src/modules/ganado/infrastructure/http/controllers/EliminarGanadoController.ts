import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { EliminarGanadoUseCase } from "../../../application/useCases/EliminarGanadoUseCase";
import { ganadoIdSchema } from "../schemas/GanadoSchemas";

@injectable()
export class EliminarGanadoController extends BaseController {
	constructor(
		@inject("EliminarGanadoUseCase")
		private readonly eliminarGanadoUseCase: EliminarGanadoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const { id } = validate(ganadoIdSchema, { id: idParam });

			await this.eliminarGanadoUseCase.run(id);
			return this.ok(c, { success: true });
		});
	};
}
