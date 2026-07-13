import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { DarDeBajaGanadoUseCase } from "../../../application/useCases/DarDeBajaGanadoUseCase";
import { darDeBajaSchema } from "../schemas/GanadoSchemas";
import { BaseError } from "@/core/shared/domain/error/BaseError";

@injectable()
export class DarDeBajaGanadoController extends BaseController {
	constructor(
		@inject("DarDeBajaGanadoUseCase")
		private readonly darDeBajaGanadoUseCase: DarDeBajaGanadoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const id = Number(idParam);
			if (Number.isNaN(id) || id <= 0) {
				throw new BaseError("El ID de ganado no es válido", 400);
			}

			const body = await c.req.json();
			const dto = validate(darDeBajaSchema, body);
			const result = await this.darDeBajaGanadoUseCase.run(id, dto);
			return this.ok(c, result);
		});
	};
}
