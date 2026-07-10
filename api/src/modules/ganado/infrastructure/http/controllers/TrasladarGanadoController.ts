import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { TrasladarGanadoUseCase } from "../../../application/useCases/TrasladarGanadoUseCase";
import {
	trasladarGanadoSchema,
	ganadoIdSchema,
} from "../schemas/GanadoSchemas";

@injectable()
export class TrasladarGanadoController extends BaseController {
	constructor(
		@inject("TrasladarGanadoUseCase")
		private readonly trasladarGanadoUseCase: TrasladarGanadoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const { id } = validate(ganadoIdSchema, { id: idParam });

			const body = await c.req.json();
			const { ranchoId } = validate(trasladarGanadoSchema, body);

			const result = await this.trasladarGanadoUseCase.run(id, ranchoId);
			return this.ok(c, result);
		});
	};
}
