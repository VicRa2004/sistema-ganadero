import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { sesionSanitariaService } from "../services/sesionSanitariaService";
import type { RegistrarSesionSanitariaInput } from "../types";

export function useRegistrarSesionSanitaria() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Sesión sanitaria registrada" },
		mutationFn: (input: RegistrarSesionSanitariaInput) =>
			sesionSanitariaService.registrar(input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.sesionesSanitarias.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.sesionesSanitarias.calendarioAll(),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.all });
			queryClient.invalidateQueries({
				queryKey: queryKeys.dashboard.resumen(),
			});
		},
	});
}
