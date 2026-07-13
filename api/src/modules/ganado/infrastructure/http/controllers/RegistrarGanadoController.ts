import type { Context } from "hono";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { RegistrarGanadoUseCase } from "../../../application/useCases/RegistrarGanadoUseCase";
import { registrarGanadoSchema } from "../schemas/GanadoSchemas";

@injectable()
export class RegistrarGanadoController extends BaseController {
	constructor(
		@inject("RegistrarGanadoUseCase")
		private readonly registrarGanadoUseCase: RegistrarGanadoUseCase,
	) {
		super();
	}

	public run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.parseBody();

			const dataToValidate = {
				identificador: body.identificador,
				peso: body.peso !== undefined ? Number(body.peso) : undefined,
				fechaNacimiento: body.fechaNacimiento,
				sexo: body.sexo,
				razaId: body.razaId !== undefined ? Number(body.razaId) : undefined,
				terrenoId:
					body.terrenoId !== undefined ? Number(body.terrenoId) : undefined,
				propietarioId:
					body.propietarioId !== undefined
						? Number(body.propietarioId)
						: undefined,
				padreId: body.padreId ? Number(body.padreId) : null,
				madreId: body.madreId ? Number(body.madreId) : null,
				imagenGanado:
					body.imagenGanado === "" || typeof body.imagenGanado === "string"
						? undefined
						: body.imagenGanado,
			};

			const dto = validate(registrarGanadoSchema, dataToValidate);
			const result = await this.registrarGanadoUseCase.run({
				...dto,
				imagenGanado:
					body.imagenGanado instanceof File ? body.imagenGanado : null,
			});
			return this.created(c, result);
		});
	};
}
