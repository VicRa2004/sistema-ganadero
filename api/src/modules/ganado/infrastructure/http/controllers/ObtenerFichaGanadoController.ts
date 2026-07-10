import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ObtenerFichaGanadoUseCase } from "../../../application/useCases/ObtenerFichaGanadoUseCase";
import { ganadoIdOrIdentificadorSchema } from "../schemas/GanadoSchemas";

@injectable()
export class ObtenerFichaGanadoController extends BaseController {
	constructor(
		@inject("ObtenerFichaGanadoUseCase")
		private readonly obtenerFichaUseCase: ObtenerFichaGanadoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const param = c.req.param("idOrIdentificador");
			const { idOrIdentificador } = validate(ganadoIdOrIdentificadorSchema, {
				idOrIdentificador: param,
			});

			const result = await this.obtenerFichaUseCase.run(idOrIdentificador);
			return this.ok(c, result);
		});
	};
}
