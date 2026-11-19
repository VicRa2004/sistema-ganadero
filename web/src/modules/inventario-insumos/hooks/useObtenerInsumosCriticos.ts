import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { insumoService } from "../services/insumoService";

export function useObtenerInsumosCriticos() {
	return useQuery({
		queryKey: queryKeys.insumos.criticos(),
		queryFn: () => insumoService.obtenerCriticos(),
	});
}
