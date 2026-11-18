import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { GenerarSesionesPlanesUseCase } from "../../../application/useCases/GenerarSesionesPlanesUseCase";

@injectable()
export class GenerarSesionesPlanesController extends BaseController {
	constructor(
		@inject("GenerarSesionesPlanesUseCase")
		private readonly useCase: GenerarSesionesPlanesUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const actor = this.getActor(c);
			const result = await this.useCase.run(usuarioIdDeFiltro(actor), 7);
			return this.ok(c, result);
		});
	};
}
