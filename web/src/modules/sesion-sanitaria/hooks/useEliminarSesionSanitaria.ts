import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { sesionSanitariaService } from "../services/sesionSanitariaService";

export function useEliminarSesionSanitaria() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Sesión sanitaria eliminada" },
		mutationFn: (id: number) => sesionSanitariaService.eliminar(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.sesionesSanitarias.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.sesionesSanitarias.calendarioAll(),
			});
		},
	});
}
