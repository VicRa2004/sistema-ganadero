import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { AssignUserDirectPermissionsUseCase } from "../../../application/useCases/AssignUserDirectPermissionsUseCase";
import {
	assignUserDirectPermissionsSchema,
	userIdParamSchema,
} from "../schemas/permissionSchemas";

@injectable()
export class AssignUserDirectPermissionsController extends BaseController {
	constructor(
		@inject("AssignUserDirectPermissionsUseCase")
		private readonly useCase: AssignUserDirectPermissionsUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { userId } = validate(userIdParamSchema, {
				userId: c.req.param("userId"),
			});
			const body = await c.req.json();
			const { overrides } = validate(assignUserDirectPermissionsSchema, body);

			const result = await this.useCase.run(userId, overrides);
			return this.ok(c, result);
		});
	};
}
