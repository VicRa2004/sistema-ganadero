export type TipoInsumo = "MEDICAMENTO" | "VACUNA" | "ALIMENTO";

// ---- Paginación (shape real del API) ----

export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	totalItems: number;
	totalPages: number;
}

// ---- Output DTOs (respuestas del API) ----

export interface InsumoDto {
	id: number;
	nombre: string;
	tipo: TipoInsumo;
	stock: number;
	stockMinimo: number;
	unidadMedida: string;
	lote: string;
	fechaCaducidad: string;
	esBajoStock: boolean;
}

// ---- Input DTOs (payloads para el API) ----

export interface RegistrarInsumoInput {
	nombre: string;
	tipo: TipoInsumo;
	stockInicial: number;
	stockMinimo: number;
	unidadMedida: string;
	lote: string;
	fechaCaducidad: string;
}

export interface AbastecerInsumoInput {
	cantidad: number;
}

export interface ConsumirInsumoInput {
	cantidad: number;
}

export interface ActualizarInsumoInput {
	nombre?: string;
	tipo?: TipoInsumo;
	stockMinimo?: number;
	unidadMedida?: string;
	lote?: string;
	fechaCaducidad?: string;
}
