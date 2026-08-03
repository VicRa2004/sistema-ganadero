import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { EliminarSesionSanitariaUseCase } from "@/modules/sesion-sanitaria/application/useCases/EliminarSesionSanitariaUseCase";

@injectable()
export class EliminarSesionSanitariaController extends BaseController {
	constructor(
		@inject("EliminarSesionSanitariaUseCase")
		private readonly eliminarSesionSanitariaUseCase: EliminarSesionSanitariaUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const id = Number(idParam);
			if (Number.isNaN(id) || id <= 0) {
				throw new Error("El ID de la sesión debe ser un entero positivo");
			}

			await this.eliminarSesionSanitariaUseCase.run(id);
			return c.body(null, 204);
		});
	};
}
