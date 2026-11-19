import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ObtenerRentabilidadUseCase } from "../../../application/useCases/ObtenerRentabilidadUseCase";
import { rentabilidadQuerySchema } from "../schemas/ComercialSchemas";

@injectable()
export class ObtenerRentabilidadController extends BaseController {
	constructor(
		@inject("ObtenerRentabilidadUseCase")
		private readonly useCase: ObtenerRentabilidadUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const q = validate(rentabilidadQuerySchema, c.req.query());
			const result = await this.useCase.run(
				{
					desde: q.desde ? new Date(q.desde) : undefined,
					hasta: q.hasta ? new Date(q.hasta) : undefined,
				},
				this.getActor(c),
			);
			return this.ok(c, result);
		});
	};
}
