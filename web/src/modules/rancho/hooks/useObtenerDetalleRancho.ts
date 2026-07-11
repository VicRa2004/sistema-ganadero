import { useQuery } from "@tanstack/react-query";
import { ranchoService } from "../services/ranchoService";

export function useObtenerDetalleRancho(id: number) {
	return useQuery({
		queryKey: ["rancho", id],
		queryFn: () => ranchoService.obtenerDetalle(id),
		enabled: id > 0,
	});
}
