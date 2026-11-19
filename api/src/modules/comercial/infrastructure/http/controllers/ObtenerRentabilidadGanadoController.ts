import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ObtenerRentabilidadGanadoUseCase } from "../../../application/useCases/ObtenerRentabilidadGanadoUseCase";
import { comercialIdParamSchema } from "../schemas/ComercialSchemas";

@injectable()
export class ObtenerRentabilidadGanadoController extends BaseController {
	constructor(
		@inject("ObtenerRentabilidadGanadoUseCase")
		private readonly useCase: ObtenerRentabilidadGanadoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(comercialIdParamSchema, c.req.param());
			const result = await this.useCase.run(id, this.getActor(c));
			return this.ok(c, result);
		});
	};
}
