import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { injectable, inject } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { RegisterUseCase } from "../../../application/useCases/RegisterUseCase";

import { validate } from "@/core/shared/infrastructure/libs/validate";
import { registerSchema } from "../schemas/authSchemas";
import {
	REFRESH_COOKIE_MAX_AGE,
	REFRESH_COOKIE_NAME,
	refreshCookieOptions,
} from "../refreshTokenCookie";

@injectable()
export class RegisterController extends BaseController {
	constructor(
		@inject("RegisterUseCase")
		private readonly registerUseCase: RegisterUseCase,
	) {
		super();
	}

	run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const dto = validate(registerSchema, body);
			const { accessToken, refreshToken, user } =
				await this.registerUseCase.run(dto);

			setCookie(c, REFRESH_COOKIE_NAME, refreshToken, {
				...refreshCookieOptions,
				maxAge: REFRESH_COOKIE_MAX_AGE,
			});

			return this.created(c, { accessToken, user });
		});
	};
}
