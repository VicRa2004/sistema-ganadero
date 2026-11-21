import type { Pagination } from "@/core/shared/domain/Pagination";

export interface NuevoAuditLog {
	usuarioId: number;
	metodo: string;
	ruta: string;
	estado: number;
	ip: string | null;
	requestId: string | null;
}

export interface AuditLogRegistro extends Omit<NuevoAuditLog, "usuarioId"> {
	id: number;
	fecha: Date;
	usuario: { id: number; nombre: string; email: string } | null;
}

export interface AuditLogFilters {
	page: number;
	limit: number;
	usuarioId?: number;
	metodo?: string;
	ruta?: string;
	desde?: Date;
	hasta?: Date;
}

export interface AuditLogRepository {
	registrar(entrada: NuevoAuditLog): Promise<void>;
	listar(filters: AuditLogFilters): Promise<Pagination<AuditLogRegistro>>;
}
