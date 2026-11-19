import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { veterinarioService } from "../services/veterinarioService";
import type { ActualizarVeterinarioInput } from "../types";

export function useActualizarVeterinario(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Veterinario actualizado" },
		mutationFn: (input: ActualizarVeterinarioInput) =>
			veterinarioService.actualizar(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.veterinarios.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.veterinarios.detail(id),
			});
		},
	});
}
