import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { tratamientoMedicoService } from "../services/tratamientoMedicoService";
import type { ProgramarTratamientoInput } from "../types";

export function useProgramarTratamiento() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Tratamiento programado" },
		mutationFn: (input: ProgramarTratamientoInput) =>
			tratamientoMedicoService.programar(input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.tratamientosMedicos.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.tratamientosMedicos.porGanado(variables.ganadoId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.sesionesSanitarias.calendarioAll(),
			});
		},
	});
}
