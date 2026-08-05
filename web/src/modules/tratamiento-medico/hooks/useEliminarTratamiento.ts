import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tratamientoMedicoService } from "../services/tratamientoMedicoService";

export function useEliminarTratamiento() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => tratamientoMedicoService.eliminar(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tratamientos-medicos"] });
		},
	});
}
