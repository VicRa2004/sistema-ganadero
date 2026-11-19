import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { sesionSanitariaService } from "../services/sesionSanitariaService";
import type { SesionSanitariaFilters } from "../types";

export function useListarSesionesSanitarias(filters: SesionSanitariaFilters) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: queryKeys.sesionesSanitarias.list(filters),
		queryFn: () => sesionSanitariaService.listar(filters),
	});
}
