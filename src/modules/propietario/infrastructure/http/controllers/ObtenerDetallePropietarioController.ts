import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ObtenerDetallePropietarioUseCase } from "../../../application/useCases/ObtenerDetallePropietarioUseCase";
import { propietarioIdSchema } from "../schemas/PropietarioSchemas";

@injectable()
export class ObtenerDetallePropietarioController extends BaseController {
	constructor(
		@inject("ObtenerDetallePropietarioUseCase")
		private readonly obtenerDetalleUseCase: ObtenerDetallePropietarioUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(propietarioIdSchema, { id: c.req.param("id") });
			const result = await this.obtenerDetalleUseCase.run(id);
			return this.ok(c, result);
		});
	};
}
