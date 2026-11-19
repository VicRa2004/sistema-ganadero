import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { TrasladoMasivoLoteUseCase } from "../../../application/useCases/TrasladoMasivoLoteUseCase";
import {
	loteIdParamSchema,
	trasladoMasivoLoteSchema,
} from "../schemas/LoteSchemas";

@injectable()
export class TrasladoMasivoLoteController extends BaseController {
	constructor(
		@inject("TrasladoMasivoLoteUseCase")
		private readonly useCase: TrasladoMasivoLoteUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(loteIdParamSchema, { id: c.req.param("id") });
			const body = await c.req.json();
			const dto = validate(trasladoMasivoLoteSchema, body);
			const result = await this.useCase.run(id, dto, this.getActor(c));
			return this.ok(c, result);
		});
	};
}
