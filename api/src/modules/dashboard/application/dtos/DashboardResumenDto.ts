export interface DashboardTotalesDto {
	cabezasActivas: number;
	cabezasTotales: number;
	capacidadTotal: number;
	ocupacionPorcentaje: number;
	terrenosCount: number;
	insumosCriticosCount: number;
	insumosPorCaducarCount: number;
	tratamientosActivosCount: number;
	sesionesProgramadasCount: number;
	animalesEnRetiroCount: number;
	pesoPromedioKg: number;
	gdpPromedioKgDia: number | null;
}

export interface DashboardPorTerrenoDto {
	terrenoId: number;
	nombre: string;
	cabezas: number;
	capacidadMaxima: number;
	porcentajeOcupacion: number;
}

export interface DashboardPorRazaDto {
	razaId: number;
	nombre: string;
	cantidad: number;
}

export interface DashboardPorSexoDto {
	sexo: "MACHO" | "HEMBRA";
	cantidad: number;
}

export interface DashboardPorEdadDto {
	rango: string;
	cantidad: number;
}

export interface DashboardAltasBajasMesDto {
	mes: string;
	altas: number;
	bajas: number;
}

export interface DashboardMotivoBajaDto {
	motivo: string;
	cantidad: number;
}

export interface DashboardInsumoAlertaDto {
	id: number;
	nombre: string;
	tipo: string;
	stock: number;
	stockMinimo: number;
	unidadMedida: string;
	fechaCaducidad: string;
}

export interface DashboardTratamientoAlertaDto {
	id: number;
	ganadoId: number;
	identificador: string;
	diagnostico: string;
	fechaFin: string;
}

export interface DashboardSesionProximaDto {
	id: number;
	fecha: string;
	descripcion: string;
	insumoNombre: string;
	veterinarioNombre: string;
}

export interface DashboardResumenDto {
	totales: DashboardTotalesDto;
	porTerreno: DashboardPorTerrenoDto[];
	porRaza: DashboardPorRazaDto[];
	porSexo: DashboardPorSexoDto[];
	porRangoEdad: DashboardPorEdadDto[];
	altasYBajasPorMes: DashboardAltasBajasMesDto[];
	motivosBaja: DashboardMotivoBajaDto[];
	insumosAlerta: {
		criticos: DashboardInsumoAlertaDto[];
		porCaducar: DashboardInsumoAlertaDto[];
	};
	sanidadProxima: {
		tratamientosPorVencer: DashboardTratamientoAlertaDto[];
		sesionesProgramadas: DashboardSesionProximaDto[];
	};
}
