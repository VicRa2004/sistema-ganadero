import { inject, injectable } from "tsyringe";
import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { RegistrarVeterinarioUseCase } from "../../../application/useCases/RegistrarVeterinarioUseCase";
import { registrarVeterinarioSchema } from "../schemas/VeterinarioSchemas";

@injectable()
export class RegistrarVeterinarioController extends BaseController {
	constructor(
		@inject("RegistrarVeterinarioUseCase")
		private readonly registrarVeterinarioUseCase: RegistrarVeterinarioUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const validatedData = registrarVeterinarioSchema.parse(body);
			const user = c.get("user");

			const result = await this.registrarVeterinarioUseCase.run({
				...validatedData,
				usuarioId: user.id,
			});
			return this.created(c, result);
		});
	};
}
