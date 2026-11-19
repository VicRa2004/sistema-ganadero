import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { GetAllRolesUseCase } from "../../../application/useCases/GetAllRolesUseCase";

@injectable()
export class GetAllRolesController extends BaseController {
	constructor(
		@inject("GetAllRolesUseCase")
		private readonly useCase: GetAllRolesUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const roles = await this.useCase.run();
			return this.ok(c, roles);
		});
	};
}
