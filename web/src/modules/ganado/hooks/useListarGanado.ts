import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ganadoService } from "../services/ganadoService";
import type { GanadoFilters } from "../types";

export function useListarGanado(filters: GanadoFilters, enabled = true) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: queryKeys.ganado.list(filters),
		queryFn: () => ganadoService.listar(filters),
		enabled,
	});
}
