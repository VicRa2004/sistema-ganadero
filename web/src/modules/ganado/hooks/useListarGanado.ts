import { useQuery } from "@tanstack/react-query";
import { ganadoService } from "../services/ganadoService";
import type { GanadoFilters } from "../types";

export function useListarGanado(filters: GanadoFilters) {
	return useQuery({
		queryKey: ["ganado", filters],
		queryFn: () => ganadoService.listar(filters),
	});
}
