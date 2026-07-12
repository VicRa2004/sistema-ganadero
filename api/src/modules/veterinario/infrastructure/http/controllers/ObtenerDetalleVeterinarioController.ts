import { inject, injectable } from "tsyringe";
import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ObtenerDetalleVeterinarioUseCase } from "../../../application/useCases/ObtenerDetalleVeterinarioUseCase";
import { veterinarioIdSchema } from "../schemas/VeterinarioSchemas";

@injectable()
export class ObtenerDetalleVeterinarioController extends BaseController {
	constructor(
		@inject("ObtenerDetalleVeterinarioUseCase")
		private readonly obtenerDetalleUseCase: ObtenerDetalleVeterinarioUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(veterinarioIdSchema, { id: c.req.param("id") });
			const user = c.get("user");
			const result = await this.obtenerDetalleUseCase.run(
				id,
				user.id,
				user.role,
			);
			return this.ok(c, result);
		});
	};
}
