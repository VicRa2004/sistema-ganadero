import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { sesionSanitariaService } from "../services/sesionSanitariaService";

export function useObtenerHistorialSanitarioGanado(ganadoId: number | null) {
	return useQuery({
		queryKey: queryKeys.sesionesSanitarias.historialGanado(ganadoId ?? 0),
		queryFn: () => {
			if (!ganadoId) throw new Error("ID de ganado requerido");
			return sesionSanitariaService.obtenerHistorialGanado(ganadoId);
		},
		enabled: !!ganadoId,
	});
}
