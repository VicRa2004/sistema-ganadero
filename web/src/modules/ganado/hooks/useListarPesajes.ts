import { useQuery } from "@tanstack/react-query";
import { ganadoService } from "../services/ganadoService";

export function useListarPesajes(id: number) {
	return useQuery({
		queryKey: ["ganado", "pesajes", id],
		queryFn: () => ganadoService.listarPesajes(id),
	});
}
