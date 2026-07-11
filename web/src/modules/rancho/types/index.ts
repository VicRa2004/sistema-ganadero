export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	totalItems: number;
	totalPages: number;
}

export interface RanchoDto {
	id: number;
	nombre: string;
	ubicacion: string;
	extensionHectareas: number;
	capacidadMaxima: number;
}

export interface RanchoCapacidadDto {
	id: number;
	nombre: string;
	capacidadMaxima: number;
	cabezasGanadoActuales: number;
	espacioDisponible: number;
}

export interface RegistrarRanchoInput {
	nombre: string;
	ubicacion: string;
	extensionHectareas: number;
	capacidadMaxima: number;
}

export interface ActualizarRanchoInput {
	nombre?: string;
	ubicacion?: string;
	extensionHectareas?: number;
	capacidadMaxima?: number;
}
