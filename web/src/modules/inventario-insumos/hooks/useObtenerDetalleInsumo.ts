import { useQuery } from "@tanstack/react-query";
import { insumoService } from "../services/insumoService";

export function useObtenerDetalleInsumo(id: number) {
	return useQuery({
		queryKey: ["insumos", id],
		queryFn: () => insumoService.obtenerDetalle(id),
		enabled: id > 0,
	});
}
