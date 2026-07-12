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
			const body = await c.req.parseBody();

			const dataToValidate: Record<string, any> = {};
			if (body.nombre !== undefined) dataToValidate.nombre = body.nombre;
			if (body.telefono !== undefined) dataToValidate.telefono = body.telefono;
			if (body.correo !== undefined) {
				dataToValidate.correo = body.correo === "" ? null : body.correo;
			}
			if (body.imagenMarca !== undefined) {
				if (body.imagenMarca === "") {
					dataToValidate.imagenMarca = undefined;
				} else if (body.imagenMarca === "null") {
					dataToValidate.imagenMarca = null;
				} else {
					dataToValidate.imagenMarca = body.imagenMarca;
				}
			}

			const dto = validate(updatePropietarioSchema, dataToValidate);

			const result = await this.actualizarUseCase.run(id, dto);
			return this.ok(c, result);
		});
	};
}
