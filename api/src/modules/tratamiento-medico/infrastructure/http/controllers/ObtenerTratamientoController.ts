import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ObtenerTratamientoUseCase } from "@/modules/tratamiento-medico/application/useCases/ObtenerTratamientoUseCase";

@injectable()
export class ObtenerTratamientoController extends BaseController {
	constructor(
		@inject("ObtenerTratamientoUseCase")
		private readonly obtenerTratamientoUseCase: ObtenerTratamientoUseCase,
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

			const result = await this.obtenerTratamientoUseCase.run(
				id,
				this.getActor(c),
			);

			return this.ok(c, result);
		});
	};
}
