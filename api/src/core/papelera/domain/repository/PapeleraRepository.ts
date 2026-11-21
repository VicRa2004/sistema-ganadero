import type { Pagination } from "@/core/shared/domain/Pagination";
import type { TipoPapelera } from "../TipoPapelera";

export interface ElementoPapelera {
	id: number;
	nombre: string;
	eliminadoEn: Date;
	usuarioId: number;
	/** Hay un elemento del que depende (p. ej. su terreno) que también está eliminado. */
	dependeDeEliminado: boolean;
}

export interface PapeleraFilters {
	page: number;
	limit: number;
	/** undefined = sin restricción (ADMIN). */
	usuarioId?: number;
}

export interface PapeleraRepository {
	listar(
		tipo: TipoPapelera,
		filters: PapeleraFilters,
	): Promise<Pagination<ElementoPapelera>>;
	/** Solo devuelve elementos eliminados. */
	buscarEliminado(
		tipo: TipoPapelera,
		id: number,
	): Promise<ElementoPapelera | null>;
	restaurar(tipo: TipoPapelera, id: number): Promise<void>;
	/** Lanza error de FK si aún hay registros que lo referencian. */
	eliminarDefinitivo(tipo: TipoPapelera, id: number): Promise<void>;
	/** Ids eliminados antes de `fecha`. */
	idsEliminadosAntesDe(tipo: TipoPapelera, fecha: Date): Promise<number[]>;
}
