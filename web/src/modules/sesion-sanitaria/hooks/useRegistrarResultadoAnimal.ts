import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { sesionSanitariaService } from "../services/sesionSanitariaService";
import type { RegistrarResultadoAnimalInput } from "../types";

export function useRegistrarResultadoAnimal() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Resultado registrado" },
		mutationFn: (input: RegistrarResultadoAnimalInput) =>
			sesionSanitariaService.registrarResultadoAnimal(input),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.sesionesSanitarias.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.sesionesSanitarias.detail(variables.sesionId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.sesionesSanitarias.historialGanado(
					variables.ganadoId,
				),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.all });
		},
	});
}
