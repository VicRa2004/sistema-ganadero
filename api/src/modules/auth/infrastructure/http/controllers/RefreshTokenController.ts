import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { injectable, inject } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { RefreshTokenUseCase } from "../../../application/useCases/RefreshTokenUseCase";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { env } from "@/core/config/env";

@injectable()
export class RefreshTokenController extends BaseController {
	constructor(
		@inject("RefreshTokenUseCase")
		private readonly refreshTokenUseCase: RefreshTokenUseCase,
	) {
		super();
	}

	run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const refreshToken = getCookie(c, "refreshToken");

			if (!refreshToken) {
				throw new BaseError("Refresh token no proporcionado o expirado", 401);
			}

			const result = await this.refreshTokenUseCase.run(refreshToken);

			setCookie(c, "refreshToken", result.refreshToken, {
				httpOnly: true,
				secure: env.NODE_ENV === "prod",
				sameSite: "Lax",
				path: "/api/auth",
				maxAge: 7 * 24 * 60 * 60, // 7 días en segundos
			});

			return this.ok(c, { accessToken: result.accessToken });
		});
	};
}
