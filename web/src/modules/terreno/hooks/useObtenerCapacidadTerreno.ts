import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { terrenoService } from "../services/terrenoService";

export function useObtenerCapacidadTerreno(id: number) {
	return useQuery({
		queryKey: queryKeys.terrenos.capacidad(id),
		queryFn: () => terrenoService.obtenerCapacidad(id),
		enabled: id > 0,
	});
}
