export interface TratamientoMedicoFilters {
	page: number;
	limit: number;
	ganadoId?: number;
	activo?: boolean;
	insumoId?: number;
	veterinarioId?: number;
	search?: string;
	/** Si se indica, solo devuelve tratamientos cuyo ganado pertenece a terrenos de ese usuario. */
	usuarioId?: number;
}
