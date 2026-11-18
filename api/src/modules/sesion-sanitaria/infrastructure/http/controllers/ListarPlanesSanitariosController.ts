import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { ListarPlanesSanitariosUseCase } from "../../../application/useCases/ListarPlanesSanitariosUseCase";

@injectable()
export class ListarPlanesSanitariosController extends BaseController {
	constructor(
		@inject("ListarPlanesSanitariosUseCase")
		private readonly useCase: ListarPlanesSanitariosUseCase,
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
