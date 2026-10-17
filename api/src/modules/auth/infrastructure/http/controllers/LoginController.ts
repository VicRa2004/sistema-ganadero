import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { injectable, inject } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { LoginUseCase } from "../../../application/useCases/LoginUseCase";

import { validate } from "@/core/shared/infrastructure/libs/validate";
import { loginSchema } from "../schemas/authSchemas";
import {
	REFRESH_COOKIE_MAX_AGE,
	REFRESH_COOKIE_NAME,
	refreshCookieOptions,
} from "../refreshTokenCookie";

@injectable()
export class LoginController extends BaseController {
	constructor(
		@inject("LoginUseCase") private readonly loginUseCase: LoginUseCase,
	) {
		super();
	}

	run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const dto = validate(loginSchema, body);
			const { accessToken, refreshToken, user } =
				await this.loginUseCase.run(dto);

			setCookie(c, REFRESH_COOKIE_NAME, refreshToken, {
				...refreshCookieOptions,
				maxAge: REFRESH_COOKIE_MAX_AGE,
			});

			return this.ok(c, { accessToken, user });
		});
	};
}
