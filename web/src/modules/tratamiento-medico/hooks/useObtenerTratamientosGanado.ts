import { useQuery } from "@tanstack/react-query";
import { tratamientoMedicoService } from "../services/tratamientoMedicoService";

export function useObtenerTratamientosGanado(ganadoId: number) {
	return useQuery({
		queryKey: ["tratamientos-medicos", "ganado", ganadoId],
		queryFn: () => tratamientoMedicoService.obtenerPorGanado(ganadoId),
		enabled: ganadoId > 0,
	});
}
