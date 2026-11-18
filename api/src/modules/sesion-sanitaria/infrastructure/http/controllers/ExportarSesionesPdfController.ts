import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ExportarSesionesSanitariasUseCase } from "../../../application/useCases/ExportarSesionesSanitariasUseCase";
import { exportarSesionesQuerySchema } from "../schemas/sesionSanitariaSchema";

@injectable()
export class ExportarSesionesPdfController extends BaseController {
	constructor(
		@inject("ExportarSesionesSanitariasUseCase")
		private readonly useCase: ExportarSesionesSanitariasUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const q = validate(exportarSesionesQuerySchema, c.req.query());
			const pdf = await this.useCase.exportarPdf(
				{
					veterinarioId: q.veterinarioId,
					insumoId: q.insumoId,
					estado: q.estado,
					busqueda: q.busqueda,
					fechaInicio: q.fechaInicio ? new Date(q.fechaInicio) : undefined,
					fechaFin: q.fechaFin ? new Date(q.fechaFin) : undefined,
				},
				this.getActor(c),
			);

			return new Response(Buffer.from(pdf), {
				status: 200,
				headers: {
					"Content-Type": "application/pdf",
					"Content-Disposition":
						'attachment; filename="sesiones-sanitarias.pdf"',
				},
			});
		});
	};
}
