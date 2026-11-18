import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ImportarGanadoCsvUseCase } from "../../../application/useCases/ImportarGanadoCsvUseCase";

@injectable()
export class DescargarPlantillaGanadoController extends BaseController {
	constructor(
		@inject("ImportarGanadoCsvUseCase")
		private readonly useCase: ImportarGanadoCsvUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const csv = this.useCase.generarPlantilla();
			return new Response(csv, {
				status: 200,
				headers: {
					"Content-Type": "text/csv; charset=utf-8",
					"Content-Disposition": 'attachment; filename="plantilla-ganado.csv"',
				},
			});
		});
	};
}
