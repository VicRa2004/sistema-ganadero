import { useQuery } from "@tanstack/react-query";
import { insumoService } from "../services/insumoService";

export function useObtenerInsumosCriticos() {
	return useQuery({
		queryKey: ["insumos", "criticos"],
		queryFn: () => insumoService.obtenerCriticos(),
	});
}
