import { useQuery } from "@tanstack/react-query";
import { propietarioService } from "../services/propietarioService";

export function useObtenerDetallePropietario(id: number) {
	return useQuery({
		queryKey: ["propietarios", id],
		queryFn: () => propietarioService.obtenerDetalle(id),
		enabled: id > 0,
	});
}
