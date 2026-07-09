import type { Context } from "hono";
import { getCookie, deleteCookie } from "hono/cookie";
import { injectable, inject } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { LogoutUseCase } from "../../../application/useCases/LogoutUseCase";
import { BaseError } from "@/core/shared/domain/error/BaseError";

@injectable()
export class LogoutController extends BaseController {
	constructor(
		@inject("LogoutUseCase")
		private readonly logoutUseCase: LogoutUseCase,
	) {
		super();
	}

	run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const refreshToken = getCookie(c, "refreshToken");

			if (!refreshToken) {
				throw new BaseError("Refresh token no proporcionado o expirado", 401);
			}

			await this.logoutUseCase.run(refreshToken);

			deleteCookie(c, "refreshToken", {
				path: "/api/auth",
			});

			return this.ok(c, { message: "Sesión cerrada correctamente" });
		});
	};
}
