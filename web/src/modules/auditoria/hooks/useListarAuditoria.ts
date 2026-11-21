import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { auditoriaService } from "../services/auditoriaService";
import type { AuditoriaFilters } from "../types";

export function useListarAuditoria(filters: AuditoriaFilters) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: queryKeys.auditoria.list(filters),
		queryFn: () => auditoriaService.listar(filters),
	});
}
