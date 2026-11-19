import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { tratamientoMedicoService } from "../services/tratamientoMedicoService";

export function useObtenerDetalleTratamiento(id: number) {
	return useQuery({
		queryKey: queryKeys.tratamientosMedicos.detail(id),
		queryFn: () => tratamientoMedicoService.obtenerDetalle(id),
		enabled: id > 0,
	});
}
