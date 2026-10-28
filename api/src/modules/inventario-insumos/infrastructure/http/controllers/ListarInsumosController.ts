import type { Context } from "hono";
import { usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarInsumosUseCase } from "../../../application/useCases/ListarInsumosUseCase";
import { listarInsumosQuerySchema } from "../schemas/InsumoSchemas";

@injectable()
export class ListarInsumosController extends BaseController {
	constructor(
		@inject("ListarInsumosUseCase")
		private readonly listarInsumosUseCase: ListarInsumosUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const queryParams = c.req.query();
			const dto = validate(listarInsumosQuerySchema, queryParams);
			const filters = {
				...dto,
				usuarioId: usuarioIdDeFiltro(this.getActor(c)),
			};

			const result = await this.listarInsumosUseCase.run(filters);
			return this.ok(c, result);
		});
	};
}
