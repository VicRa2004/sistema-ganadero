import { inject, injectable } from "tsyringe";
import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ActualizarVeterinarioUseCase } from "../../../application/useCases/ActualizarVeterinarioUseCase";
import {
	actualizarVeterinarioSchema,
	veterinarioIdSchema,
} from "../schemas/VeterinarioSchemas";

@injectable()
export class ActualizarVeterinarioController extends BaseController {
	constructor(
		@inject("ActualizarVeterinarioUseCase")
		private readonly actualizarUseCase: ActualizarVeterinarioUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(veterinarioIdSchema, { id: c.req.param("id") });
			const body = await c.req.json();
			const validatedData = actualizarVeterinarioSchema.parse(body);
			const user = c.get("user");

			const result = await this.actualizarUseCase.run(
				id,
				validatedData,
				user.id,
				user.role,
			);
			return this.ok(c, result);
		});
	};
}
