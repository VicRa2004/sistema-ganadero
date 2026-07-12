export interface RegistrarTerrenoInputDto {
	nombre: string;
	ubicacion: string;
	extensionHectareas: number;
	capacidadMaxima: number;
	imagenTerreno?: File | null;
	usuarioId: number;
}

export interface ActualizarTerrenoInputDto {
	nombre?: string;
	ubicacion?: string;
	extensionHectareas?: number;
	capacidadMaxima?: number;
	imagenTerreno?: File | string | null;
	usuarioId?: number;
}

export interface TerrenoOutputDto {
	id: number;
	nombre: string;
	ubicacion: string;
	extensionHectareas: number;
	capacidadMaxima: number;
	imagenTerreno: string | null;
	usuarioId: number;
}

export interface TerrenoCapacidadOutputDto {
	id: number;
	nombre: string;
	capacidadMaxima: number;
	cabezasGanadoActuales: number;
	espacioDisponible: number;
}
