import type { PaginatedResponse, SexoGanado } from "@/modules/ganado/types";

export const TIPOS_TRANSACCION = ["COMPRA", "VENTA"] as const;
export type TipoTransaccion = (typeof TIPOS_TRANSACCION)[number];

export const CATEGORIAS_GASTO = [
	"ALIMENTO",
	"MEDICINA",
	"VETERINARIO",
	"MANO_OBRA",
	"MANTENIMIENTO",
	"OTRO",
] as const;
export type CategoriaGasto = (typeof CATEGORIAS_GASTO)[number];

export const CATEGORIA_GASTO_LABELS: Record<CategoriaGasto, string> = {
	ALIMENTO: "Alimento",
	MEDICINA: "Medicina",
	VETERINARIO: "Veterinario",
	MANO_OBRA: "Mano de obra",
	MANTENIMIENTO: "Mantenimiento",
	OTRO: "Otro",
};

export interface TransaccionGanadoItemDto {
	id: number;
	ganadoId: number;
	identificador: string;
	precio: number;
	pesoRegistro: number;
	procedencia: string | null;
}

export interface TransaccionOutputDto {
	id: number;
	tipo: TipoTransaccion;
	fecha: string;
	contraparte: string;
	total: number;
	moneda: string;
	documento: string | null;
	documentoAdjunto: string | null;
	observaciones: string | null;
	usuarioId: number;
	detalles: TransaccionGanadoItemDto[];
}

export interface RegistrarVentaItemInputDto {
	ganadoId: number;
	precio: number;
	pesoRegistro?: number;
}

export interface RegistrarVentaInputDto {
	fecha: string;
	contraparte: string;
	moneda?: string;
	documento?: string | null;
	observaciones?: string | null;
	items: RegistrarVentaItemInputDto[];
	documentoAdjunto?: File | null;
}

export interface RegistrarCompraItemInputDto {
	identificador: string;
	peso: number;
	fechaNacimiento: string;
	sexo: SexoGanado;
	razaId: number;
	terrenoId: number;
	propietarioId: number;
	precio: number;
	procedencia?: string | null;
}

export interface RegistrarCompraInputDto {
	fecha: string;
	contraparte: string;
	moneda?: string;
	documento?: string | null;
	observaciones?: string | null;
	items: RegistrarCompraItemInputDto[];
	documentoAdjunto?: File | null;
}

export interface GastoOutputDto {
	id: number;
	categoria: CategoriaGasto;
	concepto: string;
	monto: number;
	fecha: string;
	terrenoId: number | null;
	terrenoNombre: string | null;
	ganadoId: number | null;
	ganadoIdentificador: string | null;
	loteId: number | null;
	loteNombre: string | null;
	observaciones: string | null;
	usuarioId: number;
}

export interface RegistrarGastoInputDto {
	categoria: CategoriaGasto;
	concepto: string;
	monto: number;
	fecha: string;
	terrenoId?: number | null;
	ganadoId?: number | null;
	loteId?: number | null;
	observaciones?: string | null;
}

export interface ActualizarGastoInputDto {
	categoria?: CategoriaGasto;
	concepto?: string;
	monto?: number;
	fecha?: string;
	terrenoId?: number | null;
	ganadoId?: number | null;
	loteId?: number | null;
	observaciones?: string | null;
}

export interface RentabilidadAnimalDto {
	ganadoId: number;
	identificador: string;
	costoCompra: number;
	gastosDirectos: number;
	costoInsumosAplicados: number;
	costoTotal: number;
	ingresosVenta: number;
	gananciaNeta: number;
	margenPorcentaje: number | null;
}

export interface RentabilidadTerrenoDto {
	terrenoId: number;
	terrenoNombre: string;
	ingresosVenta: number;
	costoCompra: number;
	gastos: number;
	costoInsumos: number;
	costoTotal: number;
	gananciaNeta: number;
}

export interface RentabilidadPeriodoDto {
	periodo: string;
	ingresosVenta: number;
	costoCompra: number;
	gastos: number;
	costoInsumos: number;
	costoTotal: number;
	gananciaNeta: number;
}

export interface RentabilidadResumenDto {
	resumen: {
		ingresosVenta: number;
		costoCompra: number;
		gastosOperativos: number;
		costoInsumos: number;
		costoTotal: number;
		gananciaNeta: number;
		margenPorcentaje: number | null;
	};
	porAnimal: RentabilidadAnimalDto[];
	porTerreno: RentabilidadTerrenoDto[];
	porPeriodo: RentabilidadPeriodoDto[];
}

export interface TransaccionFilters {
	page?: number;
	limit?: number;
	tipo?: TipoTransaccion;
	desde?: string;
	hasta?: string;
}

export interface GastoFilters {
	page?: number;
	limit?: number;
	categoria?: CategoriaGasto;
	terrenoId?: number;
	ganadoId?: number;
	loteId?: number;
	desde?: string;
	hasta?: string;
}

export type TransaccionesPaginated = PaginatedResponse<TransaccionOutputDto>;
export type GastosPaginated = PaginatedResponse<GastoOutputDto>;
