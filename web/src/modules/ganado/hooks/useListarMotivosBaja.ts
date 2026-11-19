import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ganadoService } from "../services/ganadoService";

export function useListarMotivosBaja() {
	return useQuery({
		queryKey: queryKeys.ganado.motivosBaja(),
		queryFn: () => ganadoService.listarMotivosBaja(),
		staleTime: 1000 * 60 * 10, // 10 minutos — catálogo estático
	});
}
