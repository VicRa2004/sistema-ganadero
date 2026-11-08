import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ActualizarTratamientoUseCase } from "@/modules/tratamiento-medico/application/useCases/ActualizarTratamientoUseCase";
import { actualizarTratamientoSchema } from "../schemas/tratamientoMedicoSchema";

@injectable()
export class ActualizarTratamientoController extends BaseController {
	constructor(
		@inject("ActualizarTratamientoUseCase")
		private readonly actualizarTratamientoUseCase: ActualizarTratamientoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const id = Number(idParam);
			if (Number.isNaN(id) || id <= 0) {
				throw new ValidationError(
					"El ID del tratamiento debe ser un entero positivo",
				);
			}

			const body = await c.req.json();
			const validated = actualizarTratamientoSchema.parse(body);

			const result = await this.actualizarTratamientoUseCase.run(
				id,
				validated,
				this.getActor(c),
			);

			return this.ok(c, result);
		});
	};
}
