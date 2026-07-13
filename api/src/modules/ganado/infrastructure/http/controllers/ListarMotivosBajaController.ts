import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ListarMotivosBajaUseCase } from "../../../application/useCases/ListarMotivosBajaUseCase";

@injectable()
export class ListarMotivosBajaController extends BaseController {
	constructor(
		@inject("ListarMotivosBajaUseCase")
		private readonly listarMotivosBajaUseCase: ListarMotivosBajaUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const result = await this.listarMotivosBajaUseCase.run();
			return this.ok(c, result);
		});
	};
}
