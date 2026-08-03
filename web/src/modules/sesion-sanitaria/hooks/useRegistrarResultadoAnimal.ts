import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sesionSanitariaService } from "../services/sesionSanitariaService";
import type { RegistrarResultadoAnimalInput } from "../types";

export function useRegistrarResultadoAnimal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: RegistrarResultadoAnimalInput) =>
			sesionSanitariaService.registrarResultadoAnimal(input),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["sesiones-sanitarias"] });
			queryClient.invalidateQueries({
				queryKey: ["sesiones-sanitarias", variables.sesionId],
			});
			queryClient.invalidateQueries({ queryKey: ["insumos"] });
		},
	});
}
