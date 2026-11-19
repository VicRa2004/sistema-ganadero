import type { Actor } from "@/core/shared/domain/Actor";
import type {
	RentabilidadAnimalDto,
	RentabilidadResumenDto,
} from "../dtos/ComercialDto";

export interface RentabilidadFilters {
	desde?: Date;
	hasta?: Date;
}

export interface RentabilidadQuery {
	obtenerRentabilidad(
		filters: RentabilidadFilters,
		actor: Actor,
	): Promise<RentabilidadResumenDto>;
	obtenerRentabilidadPorGanado(
		ganadoId: number,
		actor: Actor,
	): Promise<RentabilidadAnimalDto>;
}
