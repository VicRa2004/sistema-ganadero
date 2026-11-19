import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ganadoService } from "../services/ganadoService";

export function useObtenerFichaGanado(idOrIdentificador: string | number) {
	return useQuery({
		queryKey: queryKeys.ganado.detail(idOrIdentificador),
		queryFn: () => ganadoService.obtenerDetalle(idOrIdentificador),
		enabled: !!idOrIdentificador,
	});
}
