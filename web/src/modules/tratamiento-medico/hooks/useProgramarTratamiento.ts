import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tratamientoMedicoService } from "../services/tratamientoMedicoService";
import type { ProgramarTratamientoInput } from "../types";

export function useProgramarTratamiento() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Tratamiento programado" },
		mutationFn: (input: ProgramarTratamientoInput) =>
			tratamientoMedicoService.programar(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tratamientos-medicos"] });
		},
	});
}
