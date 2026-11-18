import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { EliminarEventoReproductivoUseCase } from "../../../application/useCases/EliminarEventoReproductivoUseCase";
import { eventoReproductivoIdSchema } from "../schemas/ReproduccionSchemas";

@injectable()
export class EliminarEventoReproductivoController extends BaseController {
	constructor(
		@inject("EliminarEventoReproductivoUseCase")
		private readonly useCase: EliminarEventoReproductivoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(eventoReproductivoIdSchema, {
				id: c.req.param("id"),
			});
			await this.useCase.run(id, this.getActor(c));
			return this.ok(c, { success: true });
		});
	};
}
