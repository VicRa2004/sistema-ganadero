import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { FinalizarTratamientoUseCase } from "@/modules/tratamiento-medico/application/useCases/FinalizarTratamientoUseCase";

@injectable()
export class FinalizarTratamientoController extends BaseController {
	constructor(
		@inject("FinalizarTratamientoUseCase")
		private readonly finalizarTratamientoUseCase: FinalizarTratamientoUseCase,
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

			const result = await this.finalizarTratamientoUseCase.run(
				id,
				this.getActor(c),
			);

			return this.ok(c, result);
		});
	};
}
