import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { EliminarDefinitivoUseCase } from "../../../application/useCases/PapeleraUseCases";
import { elementoPapeleraSchema } from "../schemas/PapeleraSchemas";

@injectable()
export class EliminarDefinitivoController extends BaseController {
	constructor(
		@inject("EliminarDefinitivoUseCase")
		private readonly useCase: EliminarDefinitivoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { tipo, id } = validate(elementoPapeleraSchema, c.req.param());
			await this.useCase.run(tipo, id, this.getActor(c));
			return this.ok(c, { message: "Elemento eliminado definitivamente" });
		});
	};
}
