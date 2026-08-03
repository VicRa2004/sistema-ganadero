import { useQuery } from "@tanstack/react-query";
import { sesionSanitariaService } from "../services/sesionSanitariaService";

export function useObtenerHistorialSanitarioGanado(ganadoId: number | null) {
	return useQuery({
		queryKey: ["historial-sanitario", ganadoId],
		queryFn: () => {
			if (!ganadoId) throw new Error("ID de ganado requerido");
			return sesionSanitariaService.obtenerHistorialGanado(ganadoId);
		},
		enabled: !!ganadoId,
	});
}
