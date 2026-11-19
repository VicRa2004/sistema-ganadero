import type { Pagination } from "@/core/shared/domain/Pagination";
import type { TipoMovimientoInsumo } from "../../domain/MovimientoInsumo";

export interface InsumoOutputDto {
	id: number;
	nombre: string;
	tipo: string;
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

export interface RegistrarInsumoInputDto {
	nombre: string;
	tipo: string;
	stockInicial: number;
	stockMinimo: number;
	unidadMedida: string;
	lote: string;
	fechaCaducidad: string;
	periodoRetiroDias?: number;
	costoUnitario?: number;
	usuarioId: number;
}

export interface AbastecerInsumoInputDto {
	cantidad: number;
	costoUnitario?: number;
	motivo?: string;
}

export interface ConsumirInsumoInputDto {
	cantidad: number;
	motivo?: string;
	ganadoId?: number;
	terrenoId?: number;
	loteId?: number;
}

export interface AjustarStockInsumoInputDto {
	cantidadDelta: number;
	motivo: string;
	costoUnitario?: number;
}

export interface ActualizarInsumoInputDto {
	nombre?: string;
	tipo?: string;
	stockMinimo?: number;
	unidadMedida?: string;
	lote?: string;
	fechaCaducidad?: string;
	periodoRetiroDias?: number;
	costoUnitario?: number;
}

export interface MovimientoInsumoOutputDto {
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

export interface KardexInsumoOutputDto {
	insumoId: number;
	insumoNombre: string;
	unidadMedida: string;
	stockActual: number;
	sumaKardex: number;
	consistente: boolean;
	movimientos: Pagination<MovimientoInsumoOutputDto>;
}
