import { useQuery } from "@tanstack/react-query";
import { sesionSanitariaService } from "../services/sesionSanitariaService";

export function useObtenerDetalleSesionSanitaria(id: number | null) {
	return useQuery({
		queryKey: ["sesiones-sanitarias", id],
		queryFn: () => {
			if (!id) throw new Error("ID de sesión requerido");
			return sesionSanitariaService.obtenerDetalle(id);
		},
		enabled: !!id,
	});
}
