import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { insumoService } from "../services/insumoService";

export function useListarKardexInsumo(
	id: number,
	params?: { page?: number; limit?: number; tipo?: string },
	enabled = true,
) {
	return useQuery({
		queryKey: queryKeys.insumos.kardex(id, params),
		queryFn: () => insumoService.listarKardex(id, params),
		enabled: enabled && id > 0,
	});
}
