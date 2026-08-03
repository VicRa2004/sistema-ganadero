import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { RegistrarResultadoAnimalUseCase } from "@/modules/sesion-sanitaria/application/useCases/RegistrarResultadoAnimalUseCase";
import { registrarResultadoAnimalSchema } from "../schemas/sesionSanitariaSchema";

@injectable()
export class RegistrarResultadoAnimalController extends BaseController {
	constructor(
		@inject("RegistrarResultadoAnimalUseCase")
		private readonly registrarResultadoAnimalUseCase: RegistrarResultadoAnimalUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const validated = registrarResultadoAnimalSchema.parse(body);

			const result = await this.registrarResultadoAnimalUseCase.run(validated);
			return this.created(c, result);
		});
	};
}
