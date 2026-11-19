import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { RentabilidadResumenDto } from "../dtos/ComercialDto";
import type {
	RentabilidadFilters,
	RentabilidadQuery,
} from "../queries/RentabilidadQuery";

@injectable()
export class ObtenerRentabilidadUseCase {
	constructor(
		@inject("RentabilidadQuery")
		private readonly query: RentabilidadQuery,
	) {}

	public async run(
		filters: RentabilidadFilters,
		actor: Actor,
	): Promise<RentabilidadResumenDto> {
		return this.query.obtenerRentabilidad(filters, actor);
	}
}
