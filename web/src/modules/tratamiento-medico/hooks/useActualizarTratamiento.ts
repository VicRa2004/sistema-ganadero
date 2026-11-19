import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { tratamientoMedicoService } from "../services/tratamientoMedicoService";
import type { ActualizarTratamientoInput } from "../types";

export function useActualizarTratamiento() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Tratamiento actualizado" },
		mutationFn: ({
			id,
			input,
		}: {
			id: number;
			input: ActualizarTratamientoInput;
		}) => tratamientoMedicoService.actualizar(id, input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.tratamientosMedicos.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.tratamientosMedicos.detail(variables.id),
			});
		},
	});
}
