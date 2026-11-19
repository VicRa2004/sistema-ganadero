import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { VacunacionMasivaLoteUseCase } from "../../../application/useCases/VacunacionMasivaLoteUseCase";
import {
	loteIdParamSchema,
	vacunacionMasivaLoteSchema,
} from "../schemas/LoteSchemas";

@injectable()
export class VacunacionMasivaLoteController extends BaseController {
	constructor(
		@inject("VacunacionMasivaLoteUseCase")
		private readonly useCase: VacunacionMasivaLoteUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(loteIdParamSchema, { id: c.req.param("id") });
			const body = await c.req.json();
			const dto = validate(vacunacionMasivaLoteSchema, body);
			const result = await this.useCase.run(id, dto, this.getActor(c));
			return this.created(c, result);
		});
	};
}
