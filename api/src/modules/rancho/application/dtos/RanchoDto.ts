export interface RegistrarRanchoInputDto {
	nombre: string;
	ubicacion: string;
	extensionHectareas: number;
	capacidadMaxima: number;
}

export interface ActualizarRanchoInputDto {
	nombre?: string;
	ubicacion?: string;
	extensionHectareas?: number;
	capacidadMaxima?: number;
}

export interface RanchoOutputDto {
	id: number;
	nombre: string;
	ubicacion: string;
	extensionHectareas: number;
	capacidadMaxima: number;
}

export interface RanchoCapacidadOutputDto {
	id: number;
	nombre: string;
	capacidadMaxima: number;
	cabezasGanadoActuales: number;
	espacioDisponible: number;
}
