import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ObtenerInsumosCriticosUseCase } from "../../../application/useCases/ObtenerInsumosCriticosUseCase";

@injectable()
export class ObtenerInsumosCriticosController extends BaseController {
	constructor(
		@inject("ObtenerInsumosCriticosUseCase")
		private readonly obtenerCriticosUseCase: ObtenerInsumosCriticosUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const result = await this.obtenerCriticosUseCase.run();
			return this.ok(c, result);
		});
	};
}
