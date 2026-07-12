// ---- Paginación (shape real del API) ----

export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	totalItems: number;
	totalPages: number;
}

// ---- Output DTOs (respuestas del API) ----

export interface VeterinarioDto {
	id: number;
	nombre: string;
	telefono: string;
	cedulaProfesional: string;
	especialidad: string | null;
}

// ---- Input DTOs (payloads para el API) ----

export interface RegistrarVeterinarioInput {
	nombre: string;
	telefono: string;
	cedulaProfesional: string;
	especialidad?: string | null;
}

export interface ActualizarVeterinarioInput {
	nombre?: string;
	telefono?: string;
	cedulaProfesional?: string;
	especialidad?: string | null;
}
