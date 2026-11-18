import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ExportarInsumosUseCase } from "../../../application/useCases/ExportarInsumosUseCase";
import { exportarInsumosQuerySchema } from "../schemas/InsumoSchemas";

@injectable()
export class ExportarInsumosPdfController extends BaseController {
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
			const pdf = await this.useCase.exportarPdf({
				...query,
				actor,
			});

			return new Response(Buffer.from(pdf), {
				status: 200,
				headers: {
					"Content-Type": "application/pdf",
					"Content-Disposition":
						'attachment; filename="inventario-insumos.pdf"',
				},
			});
		});
	};
}
