import { useMutation, useQueryClient } from "@tanstack/react-query";
import { veterinarioService } from "../services/veterinarioService";
import type { RegistrarVeterinarioInput } from "../types";

export function useRegistrarVeterinario() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: RegistrarVeterinarioInput) =>
			veterinarioService.registrar(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["veterinarios"] });
		},
	});
}
