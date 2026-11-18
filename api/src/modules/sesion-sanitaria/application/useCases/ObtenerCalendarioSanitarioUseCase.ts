import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { CalendarioSanitarioOutputDto } from "../dtos/CalendarioSanitarioDto";
import type { CalendarioSanitarioQuery } from "../queries/CalendarioSanitarioQuery";

export interface ObtenerCalendarioInputDto {
	desde?: string;
	hasta?: string;
	terrenoId?: number;
	ganadoId?: number;
}

@injectable()
export class ObtenerCalendarioSanitarioUseCase {
	constructor(
		@inject("CalendarioSanitarioQuery")
		private readonly query: CalendarioSanitarioQuery,
	) {}

	public async run(
		input: ObtenerCalendarioInputDto,
		actor: Actor,
	): Promise<CalendarioSanitarioOutputDto> {
		const ahora = new Date();
		const desde = input.desde
			? new Date(input.desde)
			: new Date(ahora.getFullYear(), ahora.getMonth(), 1);
		const hasta = input.hasta
			? new Date(input.hasta)
			: new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);

		const eventos = await this.query.obtenerEventos({
			desde,
			hasta,
			actor,
			terrenoId: input.terrenoId,
			ganadoId: input.ganadoId,
		});

		return {
			desde: desde.toISOString(),
			hasta: hasta.toISOString(),
			eventos,
		};
	}
}
