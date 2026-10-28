import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ganadoService } from "../services/ganadoService";
import type { RegistrarGanadoInput } from "../types";

export function useRegistrarGanado() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Ganado registrado" },
		mutationFn: (input: RegistrarGanadoInput) => ganadoService.registrar(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ganado"] });
		},
	});
}
