import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { tratamientoMedicoService } from "../services/tratamientoMedicoService";

export function useFinalizarTratamiento() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Tratamiento finalizado" },
		mutationFn: (id: number) => tratamientoMedicoService.finalizar(id),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.tratamientosMedicos.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.tratamientosMedicos.detail(id),
			});
		},
	});
}
