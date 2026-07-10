import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarGanadosUseCase } from "../../../application/useCases/ListarGanadosUseCase";
import { listarGanadoQuerySchema } from "../schemas/GanadoSchemas";

@injectable()
export class ListarGanadosController extends BaseController {
	constructor(
		@inject("ListarGanadosUseCase")
		private readonly listarGanadosUseCase: ListarGanadosUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const query = c.req.query();
			const dto = validate(listarGanadoQuerySchema, query);
			const result = await this.listarGanadosUseCase.run(dto);
			return this.ok(c, result);
		});
	};
}
