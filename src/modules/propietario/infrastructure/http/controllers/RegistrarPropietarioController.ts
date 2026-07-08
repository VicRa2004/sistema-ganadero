import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { RegistrarPropietarioUseCase } from "../../../application/useCases/RegistrarPropietarioUseCase";
import { createPropietarioSchema } from "../schemas/PropietarioSchemas";

@injectable()
export class RegistrarPropietarioController extends BaseController {
	constructor(
		@inject("RegistrarPropietarioUseCase")
		private readonly registrarPropietarioUseCase: RegistrarPropietarioUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const dto = validate(createPropietarioSchema, body);

			// Si el correo viene como string vacío, lo normalizamos a undefined o null
			if (dto.correo === "") {
				dto.correo = null;
			}

			const result = await this.registrarPropietarioUseCase.run(dto);
			return this.created(c, result);
		});
	};
}
