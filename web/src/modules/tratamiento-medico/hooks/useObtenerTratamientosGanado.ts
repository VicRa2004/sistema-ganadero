import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { tratamientoMedicoService } from "../services/tratamientoMedicoService";

export function useObtenerTratamientosGanado(ganadoId: number) {
	return useQuery({
		queryKey: queryKeys.tratamientosMedicos.porGanado(ganadoId),
		queryFn: () => tratamientoMedicoService.obtenerPorGanado(ganadoId),
		enabled: ganadoId > 0,
	});
}
