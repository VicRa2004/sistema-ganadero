import type { PaginatedResponse } from "@/modules/ganado/types";

export const PROPOSITOS_LOTE = [
	"ENGORDA",
	"DESTETE",
	"VIENTRES",
	"RECRIA",
	"LECHE",
	"OTRO",
] as const;
export type PropositoLote = (typeof PROPOSITOS_LOTE)[number];

export interface LoteMiembroInfo {
	ganadoId: number;
	identificador: string;
	peso: number;
	sexo: "MACHO" | "HEMBRA";
	razaNombre: string;
	terrenoId: number;
	terrenoNombre: string;
	fechaBaja: string | null;
	fechaIngreso: string;
}

export interface LoteOutputDto {
	id: number;
	nombre: string;
	proposito: PropositoLote;
	descripcion: string | null;
	terrenoId: number | null;
	terrenoNombre: string | null;
	activo: boolean;
	usuarioId: number;
	cantidadAnimales: number;
}

export interface LoteDetalleOutputDto extends LoteOutputDto {
	miembros: LoteMiembroInfo[];
}

export interface CrearLoteInputDto {
	nombre: string;
	proposito: PropositoLote;
	descripcion?: string | null;
	terrenoId?: number | null;
	activo?: boolean;
	ganadoIds?: number[];
}

export interface ActualizarLoteInputDto {
	nombre?: string;
	proposito?: PropositoLote;
	descripcion?: string | null;
	terrenoId?: number | null;
	activo?: boolean;
}

export interface PesajeMasivoLoteInputDto {
	fecha?: string;
	observaciones?: string | null;
	items: Array<{ ganadoId: number; peso: number }>;
}

export interface TrasladoMasivoLoteInputDto {
	terrenoDestinoId: number;
}

export interface VacunacionMasivaLoteInputDto {
	fecha: string;
	veterinarioId: number;
	insumoId: number;
	dosisPorAnimal: number;
	descripcion: string;
}

export interface LoteFilters {
	page?: number;
	limit?: number;
	nombre?: string;
	proposito?: PropositoLote;
	activo?: boolean;
}

export type LotesPaginated = PaginatedResponse<LoteOutputDto>;
