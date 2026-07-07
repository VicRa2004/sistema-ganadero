import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { DeleteRazaUseCase } from "../../../application/useCases/DeleteRazaUseCase";
import { razaIdSchema } from "../schemas/RazaSchemas";

@injectable()
export class DeleteRazaController extends BaseController {
	constructor(
		@inject("DeleteRazaUseCase")
		private readonly deleteRazaUseCase: DeleteRazaUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const { id } = validate(razaIdSchema, { id: idParam });

			await this.deleteRazaUseCase.run(id);
			return c.body(null, 204);
		});
	};
}
