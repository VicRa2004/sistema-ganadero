import { inject, injectable } from "tsyringe";
import { usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ListarVeterinariosUseCase } from "../../../application/useCases/ListarVeterinariosUseCase";
import { listarVeterinariosQuerySchema } from "../schemas/VeterinarioSchemas";

@injectable()
export class ListarVeterinariosController extends BaseController {
	constructor(
		@inject("ListarVeterinariosUseCase")
		private readonly listarUseCase: ListarVeterinariosUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const queryParams = validate(
				listarVeterinariosQuerySchema,
				c.req.query(),
			);
			const filters = {
				...queryParams,
				usuarioId: usuarioIdDeFiltro(this.getActor(c)),
			};
			const result = await this.listarUseCase.run(filters);
			return this.ok(c, result);
		});
	};
}
