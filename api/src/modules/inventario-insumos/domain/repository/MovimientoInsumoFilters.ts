import type { TipoMovimientoInsumo } from "../MovimientoInsumo";

export interface MovimientoInsumoFilters {
	insumoId: number;
	page: number;
	limit: number;
	tipo?: TipoMovimientoInsumo;
	desde?: Date;
	hasta?: Date;
}
