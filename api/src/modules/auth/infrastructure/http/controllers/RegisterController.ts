import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { injectable, inject } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { RegisterUseCase } from "../../../application/useCases/RegisterUseCase";
import { env } from "@/core/config/env";

import { validate } from "@/core/shared/infrastructure/libs/validate";
import { registerSchema } from "../schemas/authSchemas";

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

			setCookie(c, "refreshToken", refreshToken, {
				httpOnly: true,
				secure: env.NODE_ENV === "prod",
				sameSite: "Lax",
				path: "/api/auth",
				maxAge: 7 * 24 * 60 * 60, // 7 días en segundos
			});

			return this.created(c, { accessToken, user });
		});
	};
}
