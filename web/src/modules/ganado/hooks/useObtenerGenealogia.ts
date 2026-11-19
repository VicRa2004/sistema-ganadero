import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ganadoService } from "../services/ganadoService";

export function useObtenerGenealogia(id: number, generaciones = 3) {
	return useQuery({
		queryKey: queryKeys.ganado.genealogia(id, generaciones),
		queryFn: () => ganadoService.obtenerGenealogia(id, generaciones),
		enabled: id > 0,
	});
}
