import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ActualizarDatosPropietarioUseCase } from "../../../application/useCases/ActualizarDatosPropietarioUseCase";
import {
	propietarioIdSchema,
	updatePropietarioSchema,
} from "../schemas/PropietarioSchemas";

@injectable()
export class ActualizarPropietarioController extends BaseController {
	constructor(
		@inject("ActualizarDatosPropietarioUseCase")
		private readonly actualizarUseCase: ActualizarDatosPropietarioUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { id } = validate(propietarioIdSchema, { id: c.req.param("id") });
			const body = await c.req.json();
			const dto = validate(updatePropietarioSchema, body);

			if (dto.correo === "") {
				dto.correo = null;
			}

			const result = await this.actualizarUseCase.run(id, dto);
			return this.ok(c, result);
		});
	};
}
