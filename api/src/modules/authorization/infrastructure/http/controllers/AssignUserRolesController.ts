import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { AssignUserRolesUseCase } from "../../../application/useCases/AssignUserRolesUseCase";
import {
	assignUserRolesSchema,
	userIdParamSchema,
} from "../schemas/permissionSchemas";

@injectable()
export class AssignUserRolesController extends BaseController {
	constructor(
		@inject("AssignUserRolesUseCase")
		private readonly useCase: AssignUserRolesUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { userId } = validate(userIdParamSchema, {
				userId: c.req.param("userId"),
			});
			const body = await c.req.json();
			const { roleIds } = validate(assignUserRolesSchema, body);
			const actor = c.get("user");

			const result = await this.useCase.run(userId, roleIds, actor.id);
			return this.ok(c, result);
		});
	};
}
