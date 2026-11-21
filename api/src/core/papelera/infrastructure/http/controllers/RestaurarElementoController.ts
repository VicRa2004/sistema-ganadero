import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { RestaurarElementoUseCase } from "../../../application/useCases/PapeleraUseCases";
import { elementoPapeleraSchema } from "../schemas/PapeleraSchemas";

@injectable()
export class RestaurarElementoController extends BaseController {
	constructor(
		@inject("RestaurarElementoUseCase")
		private readonly useCase: RestaurarElementoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { tipo, id } = validate(elementoPapeleraSchema, c.req.param());
			await this.useCase.run(tipo, id, this.getActor(c));
			return this.ok(c, { message: "Elemento restaurado" });
		});
	};
}
