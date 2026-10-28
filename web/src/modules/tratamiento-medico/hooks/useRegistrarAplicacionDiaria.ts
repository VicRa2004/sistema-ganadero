import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tratamientoMedicoService } from "../services/tratamientoMedicoService";
import type { RegistrarAplicacionDiariaInput } from "../types";

export function useRegistrarAplicacionDiaria() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Aplicación registrada" },
		mutationFn: (input: RegistrarAplicacionDiariaInput) =>
			tratamientoMedicoService.registrarAplicacion(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tratamientos-medicos"] });
			queryClient.invalidateQueries({ queryKey: ["insumos"] });
		},
	});
}
