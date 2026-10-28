import type { Context } from "hono";
import { deleteCookie } from "hono/cookie";
import { injectable, inject } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ChangePasswordUseCase } from "../../../application/useCases/ChangePasswordUseCase";
import { changePasswordSchema } from "../schemas/authSchemas";
import {
	REFRESH_COOKIE_NAME,
	refreshCookieOptions,
} from "../refreshTokenCookie";

@injectable()
export class ChangePasswordController extends BaseController {
	constructor(
		@inject("ChangePasswordUseCase")
		private readonly changePasswordUseCase: ChangePasswordUseCase,
	) {
		super();
	}

	run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { currentPassword, newPassword } = validate(
				changePasswordSchema,
				await c.req.json(),
			);
			await this.changePasswordUseCase.run(
				c.get("user").id,
				currentPassword,
				newPassword,
			);

			// Todas las sesiones quedan revocadas: hay que volver a iniciar sesión
			deleteCookie(c, REFRESH_COOKIE_NAME, refreshCookieOptions);

			return this.ok(c, { message: "Contraseña actualizada correctamente" });
		});
	};
}
