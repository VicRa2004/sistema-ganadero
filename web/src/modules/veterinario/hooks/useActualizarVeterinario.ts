import { useMutation, useQueryClient } from "@tanstack/react-query";
import { veterinarioService } from "../services/veterinarioService";
import type { ActualizarVeterinarioInput } from "../types";

export function useActualizarVeterinario(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: ActualizarVeterinarioInput) =>
			veterinarioService.actualizar(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["veterinarios"] });
			queryClient.invalidateQueries({ queryKey: ["veterinarios", id] });
		},
	});
}
