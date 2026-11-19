import type { Pagination } from "@/core/shared/domain/Pagination";
import type { MovimientoInsumo } from "../MovimientoInsumo";
import type { MovimientoInsumoFilters } from "./MovimientoInsumoFilters";

export interface MovimientoInsumoRepository {
	registrar(movimiento: MovimientoInsumo): Promise<MovimientoInsumo>;
	registrarMuchos(movimientos: MovimientoInsumo[]): Promise<void>;
	findByInsumo(
		filters: MovimientoInsumoFilters,
	): Promise<Pagination<MovimientoInsumo>>;
	sumDeltaByInsumo(insumoId: number): Promise<number>;
}
