import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { tratamientoMedicoService } from "../services/tratamientoMedicoService";
import type { RegistrarAplicacionDiariaInput } from "../types";

export function useRegistrarAplicacionDiaria() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Aplicación registrada" },
		mutationFn: (input: RegistrarAplicacionDiariaInput) =>
			tratamientoMedicoService.registrarAplicacion(input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.tratamientosMedicos.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.tratamientosMedicos.detail(variables.tratamientoId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.all });
		},
	});
}
