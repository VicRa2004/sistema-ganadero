// ---- Paginación (shape real del API) ----

export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	totalItems: number;
	totalPages: number;
}

// ---- Output DTOs (respuestas del API) ----

export interface PropietarioDto {
	id: number;
	nombre: string;
	telefono: string | null;
	correo: string | null;
	imagenMarca: string | null;
}

export interface GanadoResumenDto {
	id: number;
	identificador: string;
	peso: number;
	sexo: string;
}

export interface TerrenoResumenDto {
	id: number;
	nombre: string;
	ubicacion: string;
}

export interface PropietarioDetalleDto extends PropietarioDto {
	cantidadGanado: number;
	cantidadTerrenos: number;
	ganados: GanadoResumenDto[];
	terrenos: TerrenoResumenDto[];
}

// ---- Input DTOs (payloads para el API) ----

export interface RegistrarPropietarioInput {
	nombre: string;
	telefono?: string | null;
	correo?: string | null;
	imagenMarca?: File | null;
}

export interface ActualizarPropietarioInput {
	nombre?: string;
	telefono?: string | null;
	correo?: string | null;
	imagenMarca?: File | string | null;
}
