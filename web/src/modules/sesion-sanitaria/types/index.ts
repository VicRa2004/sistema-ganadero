export interface AplicacionSanitariaInput {
	ganadoId: number;
	dosisAplicada: number;
	observaciones?: string | null;
}

export interface RegistrarSesionSanitariaInput {
	fecha: string;
	veterinarioId: number;
	descripcion: string;
	insumoId: number;
	aplicaciones: AplicacionSanitariaInput[];
}

export interface RegistrarResultadoAnimalInput {
	sesionId: number;
	ganadoId: number;
	dosisAplicada: number;
	observaciones?: string | null;
}

export interface AplicacionSanitariaDto {
	id: number;
	sesionId: number;
	ganadoId: number;
	identificadorGanado?: string;
	dosisAplicada: number;
	observaciones: string | null;
	createdAt?: string;
}

export interface SesionSanitariaDto {
	id: number;
	fecha: string;
	veterinarioId: number;
	nombreVeterinario?: string;
	descripcion: string;
	insumoId: number;
	nombreInsumo?: string;
	unidadMedidaInsumo?: string;
	totalDosisAplicadas: number;
	totalAnimales: number;
	aplicaciones: AplicacionSanitariaDto[];
	createdAt?: string;
}

export interface HistorialSanitarioGanadoDto {
	aplicacionId: number;
	sesionId: number;
	fechaSesion: string;
	descripcionSesion: string;
	nombreVeterinario?: string;
	nombreInsumo?: string;
	unidadMedidaInsumo?: string;
	dosisAplicada: number;
	observaciones: string | null;
}

export interface SesionSanitariaFilters {
	page: number;
	limit: number;
	veterinarioId?: number;
	insumoId?: number;
	busqueda?: string;
	fechaInicio?: string;
	fechaFin?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	totalItems: number;
	totalPages: number;
}
