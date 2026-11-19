import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import type { GanadoAccessService } from "@/modules/ganado/application/services/GanadoAccessService";
import type { RentabilidadAnimalDto } from "../dtos/ComercialDto";
import type { RentabilidadQuery } from "../queries/RentabilidadQuery";

@injectable()
export class ObtenerRentabilidadGanadoUseCase {
	constructor(
		@inject("GanadoAccessService")
		private readonly ganadoAccess: GanadoAccessService,
		@inject("RentabilidadQuery")
		private readonly query: RentabilidadQuery,
	) {}

	public async run(
		ganadoId: number,
		actor: Actor,
	): Promise<RentabilidadAnimalDto> {
		await this.ganadoAccess.obtenerGanado(ganadoId, actor);
		return this.query.obtenerRentabilidadPorGanado(ganadoId, actor);
	}
}
