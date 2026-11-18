import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ExportarSesionesSanitariasUseCase } from "../../../application/useCases/ExportarSesionesSanitariasUseCase";

@injectable()
export class ExportarHistorialGanadoPdfController extends BaseController {
	constructor(
		@inject("ExportarSesionesSanitariasUseCase")
		private readonly useCase: ExportarSesionesSanitariasUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const ganadoId = Number(c.req.param("ganadoId"));
			if (Number.isNaN(ganadoId) || ganadoId <= 0) {
				throw new BaseError("ID de ganado inválido", 400);
			}
			const pdf = await this.useCase.exportarHistorialGanadoPdf(
				ganadoId,
				this.getActor(c),
			);

			return new Response(Buffer.from(pdf), {
				status: 200,
				headers: {
					"Content-Type": "application/pdf",
					"Content-Disposition": `attachment; filename="historial-sanitario-${ganadoId}.pdf"`,
				},
			});
		});
	};
}
