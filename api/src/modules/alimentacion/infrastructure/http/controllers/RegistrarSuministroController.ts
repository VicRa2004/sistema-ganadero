import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { RegistrarSuministroUseCase } from "../../../application/useCases/RegistrarSuministroUseCase";
import {
	racionIdParamSchema,
	registrarSuministroSchema,
} from "../schemas/AlimentacionSchemas";

@injectable()
export class RegistrarSuministroController extends BaseController {
	constructor(
		@inject("RegistrarSuministroUseCase")
		private readonly useCase: RegistrarSuministroUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(racionIdParamSchema, { id: c.req.param("id") });
			const body = await c.req.json();
			const dto = validate(registrarSuministroSchema, body);
			const result = await this.useCase.run(id, dto, this.getActor(c));
			return this.created(c, result);
		});
	};
}
