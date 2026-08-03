import { useQuery } from "@tanstack/react-query";
import { sesionSanitariaService } from "../services/sesionSanitariaService";
import type { SesionSanitariaFilters } from "../types";

export function useListarSesionesSanitarias(filters: SesionSanitariaFilters) {
	return useQuery({
		queryKey: ["sesiones-sanitarias", filters],
		queryFn: () => sesionSanitariaService.listar(filters),
	});
}
