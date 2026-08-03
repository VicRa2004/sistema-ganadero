import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sesionSanitariaService } from "../services/sesionSanitariaService";

export function useEliminarSesionSanitaria() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => sesionSanitariaService.eliminar(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sesiones-sanitarias"] });
		},
	});
}
