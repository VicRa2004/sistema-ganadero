import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ExportarGanadoUseCase } from "../../../application/useCases/ExportarGanadoUseCase";
import { ganadoIdOrIdentificadorSchema } from "../schemas/GanadoSchemas";

@injectable()
export class ExportarFichaGanadoPdfController extends BaseController {
	constructor(
		@inject("ExportarGanadoUseCase")
		private readonly useCase: ExportarGanadoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const param = c.req.param("idOrIdentificador");
			const { idOrIdentificador } = validate(ganadoIdOrIdentificadorSchema, {
				idOrIdentificador: param,
			});
			const pdf = await this.useCase.exportarFichaPdf(
				idOrIdentificador,
				this.getActor(c),
			);
			return new Response(Buffer.from(pdf), {
				status: 200,
				headers: {
					"Content-Type": "application/pdf",
					"Content-Disposition": `attachment; filename="ficha-ganado-${idOrIdentificador}.pdf"`,
				},
			});
		});
	};
}
