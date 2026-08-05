import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tratamientoMedicoService } from "../services/tratamientoMedicoService";

export function useFinalizarTratamiento() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => tratamientoMedicoService.finalizar(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tratamientos-medicos"] });
		},
	});
}
