import { useQuery } from "@tanstack/react-query";
import { terrenoService } from "../services/terrenoService";

export function useObtenerDetalleTerreno(id: number) {
	return useQuery({
		queryKey: ["terreno", id],
		queryFn: () => terrenoService.obtenerDetalle(id),
		enabled: id > 0,
	});
}
