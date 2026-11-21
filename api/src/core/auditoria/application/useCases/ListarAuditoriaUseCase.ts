import { inject, injectable } from "tsyringe";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type {
	AuditLogFilters,
	AuditLogRepository,
} from "../../domain/repository/AuditLogRepository";

export interface AuditLogOutputDto {
	id: number;
	fecha: string;
	metodo: string;
	ruta: string;
	estado: number;
	ip: string | null;
	requestId: string | null;
	usuario: { id: number; nombre: string; email: string } | null;
}

@injectable()
export class ListarAuditoriaUseCase {
	constructor(
		@inject("AuditLogRepository")
		private readonly repository: AuditLogRepository,
	) {}

	public async run(
		filters: AuditLogFilters,
	): Promise<Pagination<AuditLogOutputDto>> {
		const result = await this.repository.listar(filters);
		return {
			...result,
			data: result.data.map((r) => ({ ...r, fecha: r.fecha.toISOString() })),
		};
	}
}
