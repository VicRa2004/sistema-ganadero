import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { RegistrarEventoReproductivoUseCase } from "../../../application/useCases/RegistrarEventoReproductivoUseCase";
import { registrarEventoReproductivoSchema } from "../schemas/ReproduccionSchemas";

@injectable()
export class RegistrarEventoReproductivoController extends BaseController {
	constructor(
		@inject("RegistrarEventoReproductivoUseCase")
		private readonly useCase: RegistrarEventoReproductivoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const dto = validate(registrarEventoReproductivoSchema, body);
			const result = await this.useCase.run(dto, this.getActor(c));
			return this.created(c, result);
		});
	};
}
