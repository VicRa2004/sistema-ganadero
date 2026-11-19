import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { PesajeMasivoLoteUseCase } from "../../../application/useCases/PesajeMasivoLoteUseCase";
import {
	loteIdParamSchema,
	pesajeMasivoLoteSchema,
} from "../schemas/LoteSchemas";

@injectable()
export class PesajeMasivoLoteController extends BaseController {
	constructor(
		@inject("PesajeMasivoLoteUseCase")
		private readonly useCase: PesajeMasivoLoteUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(loteIdParamSchema, { id: c.req.param("id") });
			const body = await c.req.json();
			const dto = validate(pesajeMasivoLoteSchema, body);
			const result = await this.useCase.run(id, dto, this.getActor(c));
			return this.created(c, result);
		});
	};
}
