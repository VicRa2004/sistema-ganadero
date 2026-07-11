import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { RegistrarRanchoUseCase } from "../../../application/useCases/RegistrarRanchoUseCase";
import { createRanchoSchema } from "../schemas/RanchoSchemas";

@injectable()
export class RegistrarRanchoController extends BaseController {
	constructor(
		@inject("RegistrarRanchoUseCase")
		private readonly registrarRanchoUseCase: RegistrarRanchoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const dto = validate(createRanchoSchema, body);
			const user = c.get("user");
			const result = await this.registrarRanchoUseCase.run({
				...dto,
				usuarioId: user.id,
			});
			return this.created(c, result);
		});
	};
}
