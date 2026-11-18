import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ExportarInsumosUseCase } from "../../../application/useCases/ExportarInsumosUseCase";
import { exportarInsumosQuerySchema } from "../schemas/InsumoSchemas";

@injectable()
export class ExportarInsumosCsvController extends BaseController {
	constructor(
		@inject("ExportarInsumosUseCase")
		private readonly useCase: ExportarInsumosUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const actor = this.getActor(c);
			const query = validate(exportarInsumosQuerySchema, c.req.query());
			const csv = await this.useCase.exportarCsv({
				...query,
				actor,
			});

			return new Response(csv, {
				status: 200,
				headers: {
					"Content-Type": "text/csv; charset=utf-8",
					"Content-Disposition":
						'attachment; filename="inventario-insumos.csv"',
				},
			});
		});
	};
}
