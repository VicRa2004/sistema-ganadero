import { useMutation, useQueryClient } from "@tanstack/react-query";
import { veterinarioService } from "../services/veterinarioService";

export function useEliminarVeterinario() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Veterinario eliminado" },
		mutationFn: (id: number) => veterinarioService.eliminar(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["veterinarios"] });
		},
	});
}
