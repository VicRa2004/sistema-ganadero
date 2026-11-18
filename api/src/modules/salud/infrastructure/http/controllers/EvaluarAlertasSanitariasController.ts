import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { EvaluarAlertasSanitariasUseCase } from "../../../application/useCases/EvaluarAlertasSanitariasUseCase";

@injectable()
export class EvaluarAlertasSanitariasController extends BaseController {
	constructor(
		@inject("EvaluarAlertasSanitariasUseCase")
		private readonly useCase: EvaluarAlertasSanitariasUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const actor = this.getActor(c);
			const result = await this.useCase.run(actor);
			return this.ok(c, result);
		});
	};
}
