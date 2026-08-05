export interface TratamientoMedicoDto {
	id: number;
	ganadoId: number;
	ganadoIdentificador?: string;
	diagnostico: string;
	fechaInicio: string;
	fechaFin: string;
	activo: boolean;
	insumoId: number;
	insumoNombre?: string;
	insumoUnidad?: string;
	dosisDiaria: number;
	veterinarioId: number | null;
	veterinarioNombre?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface ProgramarTratamientoInput {
	ganadoId: number;
	diagnostico: string;
	fechaInicio: string;
	fechaFin: string;
	insumoId: number;
	dosisDiaria: number;
	veterinarioId?: number | null;
}

export interface ActualizarTratamientoInput {
	diagnostico: string;
	fechaInicio: string;
	fechaFin: string;
	insumoId: number;
	dosisDiaria: number;
	veterinarioId?: number | null;
	activo?: boolean;
}

export interface RegistrarAplicacionDiariaInput {
	tratamientoId: number;
	cantidadDosis?: number;
	observaciones?: string;
}

export interface TratamientoMedicoFilters {
	page: number;
	limit: number;
	ganadoId?: number;
	activo?: boolean;
	insumoId?: number;
	veterinarioId?: number;
	search?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	totalItems: number;
	totalPages: number;
}
