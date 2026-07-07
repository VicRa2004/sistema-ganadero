import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { UpdateRazaUseCase } from "../../../application/useCases/UpdateRazaUseCase";
import { razaIdSchema, updateRazaSchema } from "../schemas/RazaSchemas";

@injectable()
export class UpdateRazaController extends BaseController {
	constructor(
		@inject("UpdateRazaUseCase")
		private readonly updateRazaUseCase: UpdateRazaUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const { id } = validate(razaIdSchema, { id: idParam });

			const body = await c.req.json();
			const dto = validate(updateRazaSchema, body);

			const result = await this.updateRazaUseCase.run(id, dto);
			return this.ok(c, result);
		});
	};
}
