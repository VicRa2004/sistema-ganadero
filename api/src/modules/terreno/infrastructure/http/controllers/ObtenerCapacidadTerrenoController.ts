import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ObtenerCapacidadTerrenoUseCase } from "../../../application/useCases/ObtenerCapacidadTerrenoUseCase";
import { terrenoIdSchema } from "../schemas/TerrenoSchemas";

@injectable()
export class ObtenerCapacidadTerrenoController extends BaseController {
	constructor(
		@inject("ObtenerCapacidadTerrenoUseCase")
		private readonly obtenerCapacidadTerrenoUseCase: ObtenerCapacidadTerrenoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const { id } = validate(terrenoIdSchema, { id: idParam });
			const user = c.get("user");

			const result = await this.obtenerCapacidadTerrenoUseCase.run(
				id,
				user.id,
				user.role,
			);
			return this.ok(c, result);
		});
	};
}
