import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ActualizarGanadoUseCase } from "../../../application/useCases/ActualizarGanadoUseCase";
import { actualizarGanadoSchema } from "../schemas/GanadoSchemas";
import { BaseError } from "@/core/shared/domain/error/BaseError";

@injectable()
export class ActualizarGanadoController extends BaseController {
	constructor(
		@inject("ActualizarGanadoUseCase")
		private readonly actualizarGanadoUseCase: ActualizarGanadoUseCase,
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
			const dto = validate(actualizarGanadoSchema, body);
			const result = await this.actualizarGanadoUseCase.run(id, dto);
			return this.ok(c, result);
		});
	};
}
