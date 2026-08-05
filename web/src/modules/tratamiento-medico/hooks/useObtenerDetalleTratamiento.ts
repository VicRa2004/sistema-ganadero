import { useQuery } from "@tanstack/react-query";
import { tratamientoMedicoService } from "../services/tratamientoMedicoService";

export function useObtenerDetalleTratamiento(id: number) {
	return useQuery({
		queryKey: ["tratamientos-medicos", id],
		queryFn: () => tratamientoMedicoService.obtenerDetalle(id),
		enabled: id > 0,
	});
}
