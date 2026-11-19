import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { AgregarMiembrosLoteUseCase } from "../../../application/useCases/AgregarMiembrosLoteUseCase";
import {
	agregarMiembrosLoteSchema,
	loteIdParamSchema,
} from "../schemas/LoteSchemas";

@injectable()
export class AgregarMiembrosLoteController extends BaseController {
	constructor(
		@inject("AgregarMiembrosLoteUseCase")
		private readonly useCase: AgregarMiembrosLoteUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(loteIdParamSchema, { id: c.req.param("id") });
			const body = await c.req.json();
			const { ganadoIds } = validate(agregarMiembrosLoteSchema, body);
			const result = await this.useCase.run(id, ganadoIds, this.getActor(c));
			return this.ok(c, result);
		});
	};
}
