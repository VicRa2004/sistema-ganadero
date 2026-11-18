import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { RealizarSesionSanitariaUseCase } from "../../../application/useCases/RealizarSesionSanitariaUseCase";

@injectable()
export class RealizarSesionSanitariaController extends BaseController {
	constructor(
		@inject("RealizarSesionSanitariaUseCase")
		private readonly useCase: RealizarSesionSanitariaUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const id = Number(c.req.param("id"));
			if (Number.isNaN(id) || id <= 0) {
				throw new BaseError("ID de sesión inválido", 400);
			}
			const result = await this.useCase.run(id, this.getActor(c));
			return this.ok(c, result);
		});
	};
}
