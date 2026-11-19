import type { Context } from "hono";
import { injectable, inject } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { UpdateUserUseCase } from "@/core/user/application/useCases/UpdateUserUseCase";
import { updateProfileSchema } from "../schemas/authSchemas";

/** Edición del perfil propio: solo nombre y email (rol, estado y contraseña van por otras vías). */
@injectable()
export class UpdateProfileController extends BaseController {
	constructor(
		@inject("UpdateUserUseCase")
		private readonly updateUserUseCase: UpdateUserUseCase,
	) {
		super();
	}

	run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const dto = validate(updateProfileSchema, await c.req.json());
			const result = await this.updateUserUseCase.run(c.get("user").id, dto);
			return this.ok(c, result);
		});
	};
}
