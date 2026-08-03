import type { Pagination } from "@/core/shared/domain/Pagination";
import type { AplicacionSanitaria } from "../AplicacionSanitaria";
import type { SesionSanitaria } from "../SesionSanitaria";
import type { SesionSanitariaFilters } from "./SesionSanitariaFilters";

export interface SesionSanitariaRepository {
	save(sesion: SesionSanitaria): Promise<SesionSanitaria>;
	findById(id: number): Promise<SesionSanitaria | null>;
	find(filters: SesionSanitariaFilters): Promise<Pagination<SesionSanitaria>>;
	delete(id: number): Promise<void>;
	findAplicacionesByGanadoId(ganadoId: number): Promise<AplicacionSanitaria[]>;
	addAplicacion(
		sesionId: number,
		aplicacion: AplicacionSanitaria,
	): Promise<AplicacionSanitaria>;
}
