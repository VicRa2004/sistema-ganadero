import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { CancelarSesionSanitariaUseCase } from "../../../application/useCases/CancelarSesionSanitariaUseCase";

@injectable()
export class CancelarSesionSanitariaController extends BaseController {
	constructor(
		@inject("CancelarSesionSanitariaUseCase")
		private readonly useCase: CancelarSesionSanitariaUseCase,
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
