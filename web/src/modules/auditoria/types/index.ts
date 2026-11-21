export type MetodoAuditoria = "POST" | "PUT" | "PATCH" | "DELETE";

export interface AuditLogDto {
	id: number;
	fecha: string;
	metodo: MetodoAuditoria;
	ruta: string;
	estado: number;
	ip: string | null;
	requestId: string | null;
	usuario: { id: number; nombre: string; email: string } | null;
}

export interface AuditoriaFilters {
	page: number;
	limit: number;
	metodo?: MetodoAuditoria;
	ruta?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	totalItems: number;
	totalPages: number;
}
