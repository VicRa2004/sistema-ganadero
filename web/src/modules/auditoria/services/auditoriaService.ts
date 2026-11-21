import { api } from "@/config/axios";
import type {
	AuditLogDto,
	AuditoriaFilters,
	PaginatedResponse,
} from "../types";

export const auditoriaService = {
	async listar(
		filters: AuditoriaFilters,
	): Promise<PaginatedResponse<AuditLogDto>> {
		const { data } = await api.get<PaginatedResponse<AuditLogDto>>(
			"/auditoria",
			{ params: { ...filters, ruta: filters.ruta || undefined } },
		);
		return data;
	},
};
