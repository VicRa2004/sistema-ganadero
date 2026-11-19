import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { GetUserAccessUseCase } from "../../../application/useCases/GetUserAccessUseCase";
import { userIdParamSchema } from "../schemas/permissionSchemas";

@injectable()
export class GetUserAccessController extends BaseController {
	constructor(
		@inject("GetUserAccessUseCase")
		private readonly useCase: GetUserAccessUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { userId } = validate(userIdParamSchema, {
				userId: c.req.param("userId"),
			});
			const result = await this.useCase.run(userId);
			return this.ok(c, result);
		});
	};
}
