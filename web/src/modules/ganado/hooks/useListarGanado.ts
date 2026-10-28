import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ganadoService } from "../services/ganadoService";
import type { GanadoFilters } from "../types";

export function useListarGanado(filters: GanadoFilters, enabled = true) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: ["ganado", filters],
		queryFn: () => ganadoService.listar(filters),
		enabled,
	});
}
