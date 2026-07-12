export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	totalItems: number;
	totalPages: number;
}

export interface TerrenoDto {
	id: number;
	nombre: string;
	ubicacion: string;
	extensionHectareas: number;
	capacidadMaxima: number;
	imagenTerreno: string | null;
}

export interface TerrenoCapacidadDto {
	id: number;
	nombre: string;
	capacidadMaxima: number;
	cabezasGanadoActuales: number;
	espacioDisponible: number;
}

export interface RegistrarTerrenoInput {
	nombre: string;
	ubicacion: string;
	extensionHectareas: number;
	capacidadMaxima: number;
	imagenTerreno?: File | null;
}

export interface ActualizarTerrenoInput {
	nombre?: string;
	ubicacion?: string;
	extensionHectareas?: number;
	capacidadMaxima?: number;
	imagenTerreno?: File | string | null;
}
