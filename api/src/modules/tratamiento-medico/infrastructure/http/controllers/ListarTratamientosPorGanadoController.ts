import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ListarTratamientosPorGanadoUseCase } from "@/modules/tratamiento-medico/application/useCases/ListarTratamientosPorGanadoUseCase";

@injectable()
export class ListarTratamientosPorGanadoController extends BaseController {
	constructor(
		@inject("ListarTratamientosPorGanadoUseCase")
		private readonly listarTratamientosPorGanadoUseCase: ListarTratamientosPorGanadoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const ganadoIdParam = c.req.param("ganadoId");
			const ganadoId = Number(ganadoIdParam);
			if (Number.isNaN(ganadoId) || ganadoId <= 0) {
				throw new ValidationError(
					"El ID del ganado debe ser un entero positivo",
				);
			}

			const result = await this.listarTratamientosPorGanadoUseCase.run(
				ganadoId,
				this.getActor(c),
			);

			return this.ok(c, result);
		});
	};
}
