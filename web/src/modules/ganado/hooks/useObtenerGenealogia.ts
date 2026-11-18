import { useQuery } from "@tanstack/react-query";
import { ganadoService } from "../services/ganadoService";

export function useObtenerGenealogia(id: number, generaciones = 3) {
	return useQuery({
		queryKey: ["ganado", "genealogia", id, generaciones],
		queryFn: () => ganadoService.obtenerGenealogia(id, generaciones),
		enabled: id > 0,
	});
}
