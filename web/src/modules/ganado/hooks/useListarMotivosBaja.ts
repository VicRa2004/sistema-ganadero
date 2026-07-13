import { useQuery } from "@tanstack/react-query";
import { ganadoService } from "../services/ganadoService";

export function useListarMotivosBaja() {
	return useQuery({
		queryKey: ["motivos-baja"],
		queryFn: () => ganadoService.listarMotivosBaja(),
		staleTime: 1000 * 60 * 10, // 10 minutos — catálogo estático
	});
}
