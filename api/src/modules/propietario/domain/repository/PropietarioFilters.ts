export interface PropietarioFilters {
	page: number;
	limit: number;
	nombre?: string;
	/** Si se indica, solo devuelve los propietarios de ese usuario. */
	usuarioId?: number;
}
