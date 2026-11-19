import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { RegistrarVentaGanadoUseCase } from "../../../application/useCases/RegistrarVentaGanadoUseCase";
import { registrarVentaSchema } from "../schemas/ComercialSchemas";
import { parseComercialPayload } from "./parseComercialPayload";

@injectable()
export class RegistrarVentaController extends BaseController {
	constructor(
		@inject("RegistrarVentaGanadoUseCase")
		private readonly useCase: RegistrarVentaGanadoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const { raw, documentoAdjunto } = await parseComercialPayload(c);
			const dto = validate(registrarVentaSchema, raw);
			const result = await this.useCase.run(
				{ ...dto, documentoAdjunto },
				this.getActor(c),
			);
			return this.created(c, result);
		});
	};
}
