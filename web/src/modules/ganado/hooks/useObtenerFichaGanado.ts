import { useQuery } from "@tanstack/react-query";
import { ganadoService } from "../services/ganadoService";

export function useObtenerFichaGanado(idOrIdentificador: string | number) {
	return useQuery({
		queryKey: ["ganado", "ficha", idOrIdentificador],
		queryFn: () => ganadoService.obtenerDetalle(idOrIdentificador),
		enabled: !!idOrIdentificador,
	});
}
