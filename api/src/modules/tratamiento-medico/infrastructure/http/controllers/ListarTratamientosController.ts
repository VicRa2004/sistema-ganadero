import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ListarTratamientosUseCase } from "@/modules/tratamiento-medico/application/useCases/ListarTratamientosUseCase";
import { listarTratamientosQuerySchema } from "../schemas/tratamientoMedicoSchema";

@injectable()
export class ListarTratamientosController extends BaseController {
	constructor(
		@inject("ListarTratamientosUseCase")
		private readonly listarTratamientosUseCase: ListarTratamientosUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const query = c.req.query();
			const validated = listarTratamientosQuerySchema.parse(query);

			const result = await this.listarTratamientosUseCase.run(
				{
					page: validated.page,
					limit: validated.limit,
					ganadoId: validated.ganadoId,
					activo: validated.activo,
					insumoId: validated.insumoId,
					veterinarioId: validated.veterinarioId,
					search: validated.search,
				},
				this.getActor(c),
			);

			return this.ok(c, result);
		});
	};
}
