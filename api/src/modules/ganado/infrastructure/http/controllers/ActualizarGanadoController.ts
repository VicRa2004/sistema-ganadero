import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ActualizarGanadoUseCase } from "../../../application/useCases/ActualizarGanadoUseCase";
import { actualizarGanadoSchema } from "../schemas/GanadoSchemas";
import { BaseError } from "@/core/shared/domain/error/BaseError";

@injectable()
export class ActualizarGanadoController extends BaseController {
	constructor(
		@inject("ActualizarGanadoUseCase")
		private readonly actualizarGanadoUseCase: ActualizarGanadoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const idParam = c.req.param("id");
			const id = Number(idParam);
			if (Number.isNaN(id) || id <= 0) {
				throw new BaseError("El ID de ganado no es válido", 400);
			}

			const body = await c.req.parseBody();

			const dataToValidate: Record<string, unknown> = {};
			if (body.identificador) dataToValidate.identificador = body.identificador;
			if (body.peso !== undefined && body.peso !== "")
				dataToValidate.peso = Number(body.peso);
			if (body.fechaNacimiento)
				dataToValidate.fechaNacimiento = body.fechaNacimiento;
			if (body.sexo) dataToValidate.sexo = body.sexo;
			if (body.razaId !== undefined && body.razaId !== "")
				dataToValidate.razaId = Number(body.razaId);
			if (body.terrenoId !== undefined && body.terrenoId !== "")
				dataToValidate.terrenoId = Number(body.terrenoId);
			if (body.propietarioId !== undefined && body.propietarioId !== "")
				dataToValidate.propietarioId = Number(body.propietarioId);
			if (body.padreId !== undefined)
				dataToValidate.padreId =
					body.padreId === "" ? null : Number(body.padreId);
			if (body.madreId !== undefined)
				dataToValidate.madreId =
					body.madreId === "" ? null : Number(body.madreId);

			const dto = validate(actualizarGanadoSchema, dataToValidate);
			const result = await this.actualizarGanadoUseCase.run(id, {
				...dto,
				imagenGanado:
					body.imagenGanado instanceof File ? body.imagenGanado : undefined,
			});
			return this.ok(c, result);
		});
	};
}
