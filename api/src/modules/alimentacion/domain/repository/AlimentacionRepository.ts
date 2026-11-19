import type { Pagination } from "@/core/shared/domain/Pagination";
import type { RacionAlimentacion } from "../RacionAlimentacion";
import type { SuministroRacion } from "../SuministroRacion";
import type { RacionFilters, SuministroFilters } from "./AlimentacionFilters";

export interface AlimentacionRepository {
	findRacionById(id: number): Promise<RacionAlimentacion | null>;
	findRaciones(filters: RacionFilters): Promise<Pagination<RacionAlimentacion>>;
	saveRacion(racion: RacionAlimentacion): Promise<RacionAlimentacion>;
	deleteRacion(id: number): Promise<void>;
	registrarSuministro(suministro: SuministroRacion): Promise<SuministroRacion>;
	findSuministros(
		filters: SuministroFilters,
	): Promise<Pagination<SuministroRacion>>;
	countAnimalesGrupo(params: {
		loteId: number | null;
		terrenoId: number | null;
	}): Promise<number>;
}
