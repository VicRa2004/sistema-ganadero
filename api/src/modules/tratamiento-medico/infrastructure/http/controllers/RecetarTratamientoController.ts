import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { RecetarTratamientoUseCase } from "@/modules/tratamiento-medico/application/useCases/RecetarTratamientoUseCase";
import { recetarTratamientoSchema } from "../schemas/tratamientoMedicoSchema";

@injectable()
export class RecetarTratamientoController extends BaseController {
	constructor(
		@inject("RecetarTratamientoUseCase")
		private readonly recetarTratamientoUseCase: RecetarTratamientoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const validated = recetarTratamientoSchema.parse(body);

			const result = await this.recetarTratamientoUseCase.run(
				validated,
				this.getActor(c),
			);

			return this.created(c, result);
		});
	};
}
