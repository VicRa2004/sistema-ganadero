import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { EliminarInsumoUseCase } from "../../../application/useCases/EliminarInsumoUseCase";
import { insumoIdSchema } from "../schemas/InsumoSchemas";

@injectable()
export class EliminarInsumoController extends BaseController {
	constructor(
		@inject("EliminarInsumoUseCase")
		private readonly eliminarUseCase: EliminarInsumoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(insumoIdSchema, { id: c.req.param("id") });
			await this.eliminarUseCase.run(id);
			return this.ok(c, { message: "Insumo eliminado correctamente" });
		});
	};
}
