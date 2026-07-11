import { useQuery } from "@tanstack/react-query";
import { ranchoService } from "../services/ranchoService";

export function useObtenerCapacidadRancho(id: number) {
	return useQuery({
		queryKey: ["rancho", id, "capacidad"],
		queryFn: () => ranchoService.obtenerCapacidad(id),
		enabled: id > 0,
	});
}
