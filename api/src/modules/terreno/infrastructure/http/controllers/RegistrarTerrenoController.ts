import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { RegistrarTerrenoUseCase } from "../../../application/useCases/RegistrarTerrenoUseCase";
import { createTerrenoSchema } from "../schemas/TerrenoSchemas";

@injectable()
export class RegistrarTerrenoController extends BaseController {
	constructor(
		@inject("RegistrarTerrenoUseCase")
		private readonly registrarTerrenoUseCase: RegistrarTerrenoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.parseBody();

			const dataToValidate = {
				nombre: body.nombre,
				ubicacion: body.ubicacion,
				extensionHectareas: body.extensionHectareas,
				capacidadMaxima: body.capacidadMaxima,
				imagenTerreno:
					body.imagenTerreno === "" || typeof body.imagenTerreno === "string"
						? undefined
						: body.imagenTerreno,
			};

			const dto = validate(createTerrenoSchema, dataToValidate);
			const user = c.get("user");
			const result = await this.registrarTerrenoUseCase.run({
				...dto,
				usuarioId: user.id,
			});
			return this.created(c, result);
		});
	};
}
