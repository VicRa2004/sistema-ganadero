import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { insumoService } from "../services/insumoService";

export function useObtenerDetalleInsumo(id: number) {
	return useQuery({
		queryKey: queryKeys.insumos.detail(id),
		queryFn: () => insumoService.obtenerDetalle(id),
		enabled: id > 0,
	});
}
