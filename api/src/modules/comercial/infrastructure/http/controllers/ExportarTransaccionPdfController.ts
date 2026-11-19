import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ExportarTransaccionPdfUseCase } from "../../../application/useCases/ExportarTransaccionPdfUseCase";
import { comercialIdParamSchema } from "../schemas/ComercialSchemas";

@injectable()
export class ExportarTransaccionPdfController extends BaseController {
	constructor(
		@inject("ExportarTransaccionPdfUseCase")
		private readonly useCase: ExportarTransaccionPdfUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(comercialIdParamSchema, c.req.param());
			const pdf = await this.useCase.run(id, this.getActor(c));
			return new Response(Buffer.from(pdf), {
				status: 200,
				headers: {
					"Content-Type": "application/pdf",
					"Content-Disposition": `attachment; filename="transaccion-${id}.pdf"`,
				},
			});
		});
	};
}
