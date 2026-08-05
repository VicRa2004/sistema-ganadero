import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tratamientoMedicoService } from "../services/tratamientoMedicoService";
import type { ActualizarTratamientoInput } from "../types";

export function useActualizarTratamiento() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			input,
		}: {
			id: number;
			input: ActualizarTratamientoInput;
		}) => tratamientoMedicoService.actualizar(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tratamientos-medicos"] });
		},
	});
}
