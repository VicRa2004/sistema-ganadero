import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sesionSanitariaService } from "../services/sesionSanitariaService";
import type { RegistrarSesionSanitariaInput } from "../types";

export function useRegistrarSesionSanitaria() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: RegistrarSesionSanitariaInput) =>
			sesionSanitariaService.registrar(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sesiones-sanitarias"] });
			queryClient.invalidateQueries({ queryKey: ["insumos"] });
		},
	});
}
