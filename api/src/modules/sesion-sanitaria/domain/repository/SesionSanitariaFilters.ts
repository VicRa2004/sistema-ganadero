export interface SesionSanitariaFilters {
	page: number;
	limit: number;
	fechaInicio?: Date;
	fechaFin?: Date;
	veterinarioId?: number;
	insumoId?: number;
	busqueda?: string;
	/** Si se indica, solo devuelve las sesiones de veterinarios de ese usuario. */
	usuarioId?: number;
}
