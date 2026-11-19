import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { propietarioService } from "../services/propietarioService";

export function useObtenerDetallePropietario(id: number) {
	return useQuery({
		queryKey: queryKeys.propietarios.detail(id),
		queryFn: () => propietarioService.obtenerDetalle(id),
		enabled: id > 0,
	});
}
