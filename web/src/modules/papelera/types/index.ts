export const TIPOS_PAPELERA = [
	{ tipo: "ganado", etiqueta: "Ganado", recurso: "ganado" },
	{ tipo: "lote", etiqueta: "Lotes", recurso: "lotes" },
	{ tipo: "terreno", etiqueta: "Terrenos", recurso: "terreno" },
	{ tipo: "propietario", etiqueta: "Propietarios", recurso: "propietario" },
	{ tipo: "insumo", etiqueta: "Insumos", recurso: "inventario-insumos" },
	{ tipo: "veterinario", etiqueta: "Veterinarios", recurso: "veterinarios" },
] as const;

export type TipoPapelera = (typeof TIPOS_PAPELERA)[number]["tipo"];

export interface ElementoPapeleraDto {
	tipo: TipoPapelera;
	id: number;
	nombre: string;
	eliminadoEn: string;
	/** Fecha a partir de la cual la purga automática lo borra definitivamente. */
	purgaEn: string;
	/** Depende de un terreno, propietario o lote que también está eliminado. */
	dependeDeEliminado: boolean;
}

export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	totalItems: number;
	totalPages: number;
}
