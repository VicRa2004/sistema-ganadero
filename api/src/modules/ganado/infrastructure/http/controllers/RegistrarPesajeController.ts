import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { RegistrarPesajeUseCase } from "../../../application/useCases/RegistrarPesajeUseCase";
import {
	registrarPesajeSchema,
	ganadoIdSchema,
} from "../schemas/GanadoSchemas";

@injectable()
export class RegistrarPesajeController extends BaseController {
	constructor(
		@inject("RegistrarPesajeUseCase")
		private readonly registrarPesajeUseCase: RegistrarPesajeUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const { id } = validate(ganadoIdSchema, { id: idParam });

			const body = await c.req.json();
			const { peso } = validate(registrarPesajeSchema, body);

			const result = await this.registrarPesajeUseCase.run(id, peso);
			return this.ok(c, result);
		});
	};
}
