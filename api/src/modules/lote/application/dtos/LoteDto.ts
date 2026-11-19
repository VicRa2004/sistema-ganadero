import type { PropositoLote } from "../../domain/PropositoLote";
import type { LoteMiembroInfo } from "../../domain/repository/LoteRepository";

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
