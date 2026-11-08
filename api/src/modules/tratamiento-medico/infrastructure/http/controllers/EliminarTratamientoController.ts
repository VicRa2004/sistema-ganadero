import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { EliminarTratamientoUseCase } from "@/modules/tratamiento-medico/application/useCases/EliminarTratamientoUseCase";

@injectable()
export class EliminarTratamientoController extends BaseController {
	constructor(
		@inject("EliminarTratamientoUseCase")
		private readonly eliminarTratamientoUseCase: EliminarTratamientoUseCase,
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

			await this.eliminarTratamientoUseCase.run(id, this.getActor(c));
			return c.body(null, 204);
		});
	};
}
