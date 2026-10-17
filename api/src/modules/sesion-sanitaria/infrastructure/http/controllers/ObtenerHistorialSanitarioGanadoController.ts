import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ObtenerHistorialSanitarioGanadoUseCase } from "@/modules/sesion-sanitaria/application/useCases/ObtenerHistorialSanitarioGanadoUseCase";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";

@injectable()
export class ObtenerHistorialSanitarioGanadoController extends BaseController {
	constructor(
		@inject("ObtenerHistorialSanitarioGanadoUseCase")
		private readonly obtenerHistorialSanitarioGanadoUseCase: ObtenerHistorialSanitarioGanadoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const ganadoIdParam = c.req.param("ganadoId");
			const ganadoId = Number(ganadoIdParam);
			if (Number.isNaN(ganadoId) || ganadoId <= 0) {
				throw new ValidationError(
					"El ID de ganado debe ser un entero positivo",
				);
			}

			const result = await this.obtenerHistorialSanitarioGanadoUseCase.run(
				ganadoId,
				this.getActor(c),
			);
			return this.ok(c, result);
		});
	};
}
