import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { injectable, inject } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { LoginUseCase } from "../../../application/useCases/LoginUseCase";
import { env } from "@/core/config/env";

import { validate } from "@/core/shared/infrastructure/libs/validate";
import { loginSchema } from "../schemas/authSchemas";

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

			setCookie(c, "refreshToken", refreshToken, {
				httpOnly: true,
				secure: env.NODE_ENV === "prod",
				sameSite: "Lax",
				path: "/api/auth",
				maxAge: 7 * 24 * 60 * 60, // 7 días en segundos
			});

			return this.ok(c, { accessToken, user });
		});
	};
}
