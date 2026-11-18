import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { EliminarPlanSanitarioUseCase } from "../../../application/useCases/EliminarPlanSanitarioUseCase";

@injectable()
export class EliminarPlanSanitarioController extends BaseController {
	constructor(
		@inject("EliminarPlanSanitarioUseCase")
		private readonly useCase: EliminarPlanSanitarioUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const id = Number(c.req.param("id"));
			if (Number.isNaN(id) || id <= 0) {
				throw new BaseError("ID de plan inválido", 400);
			}
			await this.useCase.run(id, this.getActor(c));
			return this.ok(c, { message: "Plan sanitario eliminado correctamente" });
		});
	};
}
