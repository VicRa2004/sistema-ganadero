import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { RegistrarAplicacionDiariaUseCase } from "@/modules/tratamiento-medico/application/useCases/RegistrarAplicacionDiariaUseCase";
import { registrarAplicacionDiariaSchema } from "../schemas/tratamientoMedicoSchema";

@injectable()
export class RegistrarAplicacionDiariaController extends BaseController {
	constructor(
		@inject("RegistrarAplicacionDiariaUseCase")
		private readonly registrarAplicacionDiariaUseCase: RegistrarAplicacionDiariaUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const validated = registrarAplicacionDiariaSchema.parse(body);

			const result = await this.registrarAplicacionDiariaUseCase.run(
				validated,
				this.getActor(c),
			);

			return this.ok(c, result);
		});
	};
}
