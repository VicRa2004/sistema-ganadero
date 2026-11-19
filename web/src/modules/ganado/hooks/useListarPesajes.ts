import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ganadoService } from "../services/ganadoService";

export function useListarPesajes(id: number) {
	return useQuery({
		queryKey: queryKeys.ganado.pesajes(id),
		queryFn: () => ganadoService.listarPesajes(id),
	});
}
