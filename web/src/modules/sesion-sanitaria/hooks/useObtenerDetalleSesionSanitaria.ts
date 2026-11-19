import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { sesionSanitariaService } from "../services/sesionSanitariaService";

export function useObtenerDetalleSesionSanitaria(id: number | null) {
	return useQuery({
		queryKey: queryKeys.sesionesSanitarias.detail(id ?? 0),
		queryFn: () => {
			if (!id) throw new Error("ID de sesión requerido");
			return sesionSanitariaService.obtenerDetalle(id);
		},
		enabled: !!id,
	});
}
