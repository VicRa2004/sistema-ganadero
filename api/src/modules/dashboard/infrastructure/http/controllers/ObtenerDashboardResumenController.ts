import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ObtenerDashboardResumenUseCase } from "../../../application/useCases/ObtenerDashboardResumenUseCase";

@injectable()
export class ObtenerDashboardResumenController extends BaseController {
	constructor(
		@inject("ObtenerDashboardResumenUseCase")
		private readonly useCase: ObtenerDashboardResumenUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const result = await this.useCase.run(this.getActor(c));
			return this.ok(c, result);
		});
	};
}
