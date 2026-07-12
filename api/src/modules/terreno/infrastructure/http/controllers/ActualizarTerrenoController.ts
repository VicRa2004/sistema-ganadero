import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ActualizarTerrenoUseCase } from "../../../application/useCases/ActualizarTerrenoUseCase";
import {
	updateTerrenoSchema,
	terrenoIdSchema,
} from "../schemas/TerrenoSchemas";

@injectable()
export class ActualizarTerrenoController extends BaseController {
	constructor(
		@inject("ActualizarTerrenoUseCase")
		private readonly actualizarTerrenoUseCase: ActualizarTerrenoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const { id } = validate(terrenoIdSchema, { id: idParam });
			const user = c.get("user");

			const body = await c.req.parseBody();

			const dataToValidate: Record<string, any> = {};
			if (body.nombre !== undefined) dataToValidate.nombre = body.nombre;
			if (body.ubicacion !== undefined)
				dataToValidate.ubicacion = body.ubicacion;
			if (body.extensionHectareas !== undefined) {
				dataToValidate.extensionHectareas = body.extensionHectareas;
			}
			if (body.capacidadMaxima !== undefined) {
				dataToValidate.capacidadMaxima = body.capacidadMaxima;
			}
			if (body.imagenTerreno !== undefined) {
				if (body.imagenTerreno === "") {
					dataToValidate.imagenTerreno = undefined;
				} else if (body.imagenTerreno === "null") {
					dataToValidate.imagenTerreno = null;
				} else {
					dataToValidate.imagenTerreno = body.imagenTerreno;
				}
			}

			const dto = validate(updateTerrenoSchema, dataToValidate);

			const result = await this.actualizarTerrenoUseCase.run(
				id,
				dto,
				user.id,
				user.role,
			);
			return this.ok(c, result);
		});
	};
}
