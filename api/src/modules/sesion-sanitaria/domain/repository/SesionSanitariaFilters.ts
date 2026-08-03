export interface SesionSanitariaFilters {
	page: number;
	limit: number;
	fechaInicio?: Date;
	fechaFin?: Date;
	veterinarioId?: number;
	insumoId?: number;
	busqueda?: string;
}
