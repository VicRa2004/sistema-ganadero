import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ObtenerCatalogoRazasUseCase } from "../../../application/useCases/ObtenerCatalogoRazasUseCase";

@injectable()
export class ObtenerCatalogoRazasController extends BaseController {
	constructor(
		@inject("ObtenerCatalogoRazasUseCase")
		private readonly obtenerCatalogoRazasUseCase: ObtenerCatalogoRazasUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const result = await this.obtenerCatalogoRazasUseCase.run();
			return this.ok(c, result);
		});
	};
}
