export type TipoInsumo = "MEDICAMENTO" | "VACUNA" | "ALIMENTO";
export type TipoMovimientoInsumo = "ENTRADA" | "SALIDA" | "AJUSTE";

export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	totalItems: number;
	totalPages: number;
}

export interface InsumoDto {
	id: number;
	nombre: string;
	tipo: TipoInsumo;
	stock: number;
	stockMinimo: number;
	unidadMedida: string;
	lote: string;
	fechaCaducidad: string;
	periodoRetiroDias: number;
	costoUnitario: number;
	esBajoStock: boolean;
	usuarioId: number;
}

export interface MovimientoInsumoDto {
	id: number;
	insumoId: number;
	tipo: TipoMovimientoInsumo;
	cantidad: number;
	delta: number;
	costoUnitario: number | null;
	motivo: string;
	referenciaTipo: string | null;
	referenciaId: number | null;
	ganadoId: number | null;
	terrenoId: number | null;
	loteId: number | null;
	usuarioId: number;
	fecha: string;
}

export interface KardexInsumoDto {
	insumoId: number;
	insumoNombre: string;
	unidadMedida: string;
	stockActual: number;
	sumaKardex: number;
	consistente: boolean;
	movimientos: PaginatedResponse<MovimientoInsumoDto>;
}

export interface RegistrarInsumoInput {
	nombre: string;
	tipo: TipoInsumo;
	stockInicial: number;
	stockMinimo: number;
	unidadMedida: string;
	lote: string;
	fechaCaducidad: string;
	periodoRetiroDias?: number;
	costoUnitario?: number;
}

export interface AbastecerInsumoInput {
	cantidad: number;
	costoUnitario?: number;
	motivo?: string;
}

export interface ConsumirInsumoInput {
	cantidad: number;
	motivo?: string;
	ganadoId?: number;
	terrenoId?: number;
	loteId?: number;
}

export interface AjustarStockInput {
	cantidadDelta: number;
	motivo: string;
	costoUnitario?: number;
}

export interface ActualizarInsumoInput {
	nombre?: string;
	tipo?: TipoInsumo;
	stockMinimo?: number;
	unidadMedida?: string;
	lote?: string;
	fechaCaducidad?: string;
	periodoRetiroDias?: number;
	costoUnitario?: number;
}
