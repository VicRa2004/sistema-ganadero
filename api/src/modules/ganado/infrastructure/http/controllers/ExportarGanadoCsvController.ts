import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ExportarGanadoUseCase } from "../../../application/useCases/ExportarGanadoUseCase";
import { exportarGanadoQuerySchema } from "../schemas/GanadoSchemas";

@injectable()
export class ExportarGanadoCsvController extends BaseController {
	constructor(
		@inject("ExportarGanadoUseCase")
		private readonly useCase: ExportarGanadoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const query = validate(exportarGanadoQuerySchema, c.req.query());
			const csv = await this.useCase.exportarCsv(query, this.getActor(c));
			return new Response(csv, {
				status: 200,
				headers: {
					"Content-Type": "text/csv; charset=utf-8",
					"Content-Disposition": 'attachment; filename="ganado.csv"',
				},
			});
		});
	};
}
