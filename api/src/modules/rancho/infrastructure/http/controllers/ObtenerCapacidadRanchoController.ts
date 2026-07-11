import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ObtenerCapacidadRanchoUseCase } from "../../../application/useCases/ObtenerCapacidadRanchoUseCase";
import { ranchoIdSchema } from "../schemas/RanchoSchemas";

@injectable()
export class ObtenerCapacidadRanchoController extends BaseController {
	constructor(
		@inject("ObtenerCapacidadRanchoUseCase")
		private readonly obtenerCapacidadRanchoUseCase: ObtenerCapacidadRanchoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const { id } = validate(ranchoIdSchema, { id: idParam });
			const user = c.get("user");

			const result = await this.obtenerCapacidadRanchoUseCase.run(
				id,
				user.id,
				user.role,
			);
			return this.ok(c, result);
		});
	};
}
