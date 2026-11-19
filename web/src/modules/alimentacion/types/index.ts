import type { PaginatedResponse } from "@/modules/ganado/types";

export interface RacionOutputDto {
	id: number;
	nombre: string;
	insumoId: number;
	insumoNombre: string;
	insumoUnidad: string;
	terrenoId: number | null;
	terrenoNombre: string | null;
	loteId: number | null;
	loteNombre: string | null;
	cantidadDiariaPorAnimal: number;
	diasAlertaAutonomia: number;
	activo: boolean;
	observaciones: string | null;
	usuarioId: number;
}

export interface CrearRacionInputDto {
	nombre: string;
	insumoId: number;
	terrenoId?: number | null;
	loteId?: number | null;
	cantidadDiariaPorAnimal: number;
	diasAlertaAutonomia?: number;
	activo?: boolean;
	observaciones?: string | null;
}

export interface ActualizarRacionInputDto {
	nombre?: string;
	insumoId?: number;
	terrenoId?: number | null;
	loteId?: number | null;
	cantidadDiariaPorAnimal?: number;
	diasAlertaAutonomia?: number;
	activo?: boolean;
	observaciones?: string | null;
}

export interface SuministroOutputDto {
	id: number;
	racionId: number;
	racionNombre: string;
	insumoId: number;
	insumoNombre: string;
	insumoUnidad: string;
	terrenoId: number | null;
	loteId: number | null;
	fecha: string;
	cantidadAnimales: number;
	cantidadTotal: number;
	costoTotal: number;
	observaciones: string | null;
	usuarioId: number;
}

export interface RegistrarSuministroInputDto {
	fecha?: string;
	cantidadTotalOverride?: number;
	observaciones?: string | null;
}

export interface AutonomiaAlimentoDto {
	insumoId: number;
	insumoNombre: string;
	unidadMedida: string;
	stock: number;
	consumoDiarioEsperado: number;
	diasAutonomia: number | null;
	umbralAlertaDias: number;
	enAlerta: boolean;
	racionesActivas: number;
	usuarioId: number;
}

export interface RacionFilters {
	page?: number;
	limit?: number;
	activo?: boolean;
	terrenoId?: number;
	loteId?: number;
}

export interface SuministroFilters {
	page?: number;
	limit?: number;
	racionId?: number;
	desde?: string;
	hasta?: string;
}

export type RacionesPaginated = PaginatedResponse<RacionOutputDto>;
export type SuministrosPaginated = PaginatedResponse<SuministroOutputDto>;
