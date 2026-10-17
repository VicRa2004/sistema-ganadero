import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { injectable, inject } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { RefreshTokenUseCase } from "../../../application/useCases/RefreshTokenUseCase";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import {
	REFRESH_COOKIE_MAX_AGE,
	REFRESH_COOKIE_NAME,
	refreshCookieOptions,
} from "../refreshTokenCookie";

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
			const refreshToken = getCookie(c, REFRESH_COOKIE_NAME);

			if (!refreshToken) {
				throw new BaseError("Refresh token no proporcionado o expirado", 401);
			}

			const result = await this.refreshTokenUseCase.run(refreshToken);

			setCookie(c, REFRESH_COOKIE_NAME, result.refreshToken, {
				...refreshCookieOptions,
				maxAge: REFRESH_COOKIE_MAX_AGE,
			});

			return this.ok(c, { accessToken: result.accessToken });
		});
	};
}
