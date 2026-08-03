import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ListarSesionesSanitariasUseCase } from "@/modules/sesion-sanitaria/application/useCases/ListarSesionesSanitariasUseCase";
import { listarSesionesQuerySchema } from "../schemas/sesionSanitariaSchema";

@injectable()
export class ListarSesionesSanitariasController extends BaseController {
	constructor(
		@inject("ListarSesionesSanitariasUseCase")
		private readonly listarSesionesSanitariasUseCase: ListarSesionesSanitariasUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const query = c.req.query();
			const validated = listarSesionesQuerySchema.parse(query);

			const result = await this.listarSesionesSanitariasUseCase.run({
				page: validated.page,
				limit: validated.limit,
				veterinarioId: validated.veterinarioId,
				insumoId: validated.insumoId,
				busqueda: validated.busqueda,
				fechaInicio: validated.fechaInicio
					? new Date(validated.fechaInicio)
					: undefined,
				fechaFin: validated.fechaFin ? new Date(validated.fechaFin) : undefined,
			});

			return this.ok(c, result);
		});
	};
}
