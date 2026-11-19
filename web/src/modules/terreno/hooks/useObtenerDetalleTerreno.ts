import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { terrenoService } from "../services/terrenoService";

export function useObtenerDetalleTerreno(id: number) {
	return useQuery({
		queryKey: queryKeys.terrenos.detail(id),
		queryFn: () => terrenoService.obtenerDetalle(id),
		enabled: id > 0,
	});
}
