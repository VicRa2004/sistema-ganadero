import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ImportarGanadoCsvUseCase } from "../../../application/useCases/ImportarGanadoCsvUseCase";
import { importarGanadoCsvSchema } from "../schemas/GanadoSchemas";

@injectable()
export class PrevisualizarImportacionGanadoController extends BaseController {
	constructor(
		@inject("ImportarGanadoCsvUseCase")
		private readonly useCase: ImportarGanadoCsvUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = validate(importarGanadoCsvSchema, await c.req.json());
			const result = await this.useCase.previsualizar(
				body.csv,
				this.getActor(c),
			);
			return this.ok(c, result);
		});
	};
}
