import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ObtenerDetalleRanchoUseCase } from "../../../application/useCases/ObtenerDetalleRanchoUseCase";
import { ranchoIdSchema } from "../schemas/RanchoSchemas";

@injectable()
export class ObtenerDetalleRanchoController extends BaseController {
	constructor(
		@inject("ObtenerDetalleRanchoUseCase")
		private readonly obtenerDetalleRanchoUseCase: ObtenerDetalleRanchoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const { id } = validate(ranchoIdSchema, { id: idParam });
			const user = c.get("user");

			const result = await this.obtenerDetalleRanchoUseCase.run(
				id,
				user.id,
				user.role,
			);
			return this.ok(c, result);
		});
	};
}
