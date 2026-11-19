import type { SexoGanado } from "@/modules/ganado/domain/Ganado";
import type {
	CategoriaGasto,
	TipoTransaccion,
} from "../../domain/CategoriaGasto";

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
