import { inject, injectable } from "tsyringe";
import type { Context } from "hono";
import type { GetUserPermissionsUseCase } from "../../../application/useCases/GetUserPermissionsUseCase";
import type { CheckUserPermissionUseCase } from "../../../application/useCases/CheckUserPermissionUseCase";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import { userIdParamSchema } from "../schemas/permissionSchemas";

@injectable()
export class GetUserPermissionsController extends BaseController {
	constructor(
		@inject("GetUserPermissionsUseCase")
		private readonly getUserPermissionsUseCase: GetUserPermissionsUseCase,
		@inject("CheckUserPermissionUseCase")
		private readonly checkUserPermissionUseCase: CheckUserPermissionUseCase,
	) {
		super();
	}

	run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { userId } = validate(userIdParamSchema, {
				userId: c.req.param("userId"),
			});

			const currentUser = c.get("user");
			if (!currentUser) {
				return c.json(
					{
						success: false,
						error: "Usuario no autenticado.",
					},
					401,
				);
			}

			// Si el usuario no está consultando sus propios permisos, validar el permiso administrativo 'permissions:read'
			if (currentUser.id !== userId) {
				await this.checkUserPermissionUseCase.run(
					currentUser.id,
					"permissions",
					"read",
				);
			}

			const result = await this.getUserPermissionsUseCase.run(userId);
			return this.ok(c, result);
		});
	};
}
