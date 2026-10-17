import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ObtenerDetalleSesionSanitariaUseCase } from "@/modules/sesion-sanitaria/application/useCases/ObtenerDetalleSesionSanitariaUseCase";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";

@injectable()
export class ObtenerDetalleSesionSanitariaController extends BaseController {
	constructor(
		@inject("ObtenerDetalleSesionSanitariaUseCase")
		private readonly obtenerDetalleSesionSanitariaUseCase: ObtenerDetalleSesionSanitariaUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const id = Number(idParam);
			if (Number.isNaN(id) || id <= 0) {
				throw new ValidationError(
					"El ID de la sesión debe ser un entero positivo",
				);
			}

			const result = await this.obtenerDetalleSesionSanitariaUseCase.run(
				id,
				this.getActor(c),
			);
			return this.ok(c, result);
		});
	};
}
