import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ObtenerDetalleInsumoUseCase } from "../../../application/useCases/ObtenerDetalleInsumoUseCase";
import { insumoIdSchema } from "../schemas/InsumoSchemas";

@injectable()
export class ObtenerDetalleInsumoController extends BaseController {
	constructor(
		@inject("ObtenerDetalleInsumoUseCase")
		private readonly obtenerDetalleUseCase: ObtenerDetalleInsumoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(insumoIdSchema, { id: c.req.param("id") });
			const result = await this.obtenerDetalleUseCase.run(id);
			return this.ok(c, result);
		});
	};
}
