import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { QuitarMiembroLoteUseCase } from "../../../application/useCases/QuitarMiembroLoteUseCase";
import { loteMiembroParamsSchema } from "../schemas/LoteSchemas";

@injectable()
export class QuitarMiembroLoteController extends BaseController {
	constructor(
		@inject("QuitarMiembroLoteUseCase")
		private readonly useCase: QuitarMiembroLoteUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id, ganadoId } = validate(loteMiembroParamsSchema, {
				id: c.req.param("id"),
				ganadoId: c.req.param("ganadoId"),
			});
			const result = await this.useCase.run(id, ganadoId, this.getActor(c));
			return this.ok(c, result);
		});
	};
}
