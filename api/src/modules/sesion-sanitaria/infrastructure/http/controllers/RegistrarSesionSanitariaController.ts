import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { RegistrarSesionSanitariaUseCase } from "@/modules/sesion-sanitaria/application/useCases/RegistrarSesionSanitariaUseCase";
import { registrarSesionSanitariaSchema } from "../schemas/sesionSanitariaSchema";

@injectable()
export class RegistrarSesionSanitariaController extends BaseController {
	constructor(
		@inject("RegistrarSesionSanitariaUseCase")
		private readonly registrarSesionSanitariaUseCase: RegistrarSesionSanitariaUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const validated = registrarSesionSanitariaSchema.parse(body);

			const result = await this.registrarSesionSanitariaUseCase.run(validated);
			return this.created(c, result);
		});
	};
}
