import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { tratamientoMedicoService } from "../services/tratamientoMedicoService";

export function useEliminarTratamiento() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Tratamiento eliminado" },
		mutationFn: (id: number) => tratamientoMedicoService.eliminar(id),
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
