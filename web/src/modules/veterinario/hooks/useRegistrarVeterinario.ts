import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { veterinarioService } from "../services/veterinarioService";
import type { RegistrarVeterinarioInput } from "../types";

export function useRegistrarVeterinario() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Veterinario registrado" },
		mutationFn: (input: RegistrarVeterinarioInput) =>
			veterinarioService.registrar(input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.veterinarios.lists(),
			});
		},
	});
}
