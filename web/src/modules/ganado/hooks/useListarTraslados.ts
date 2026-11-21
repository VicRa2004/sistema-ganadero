import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ganadoService } from "../services/ganadoService";

export function useListarTraslados(id: number) {
	return useQuery({
		queryKey: queryKeys.ganado.traslados(id),
		queryFn: () => ganadoService.listarTraslados(id),
	});
}
