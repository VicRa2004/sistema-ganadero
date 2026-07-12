import { useQuery } from "@tanstack/react-query";
import { terrenoService } from "../services/terrenoService";

export function useObtenerCapacidadTerreno(id: number) {
	return useQuery({
		queryKey: ["terreno", id, "capacidad"],
		queryFn: () => terrenoService.obtenerCapacidad(id),
		enabled: id > 0,
	});
}
