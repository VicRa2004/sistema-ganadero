import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ranchoService } from "../services/ranchoService";
import type { RegistrarRanchoInput } from "../types";

export function useRegistrarRancho() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: RegistrarRanchoInput) => ranchoService.registrar(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ranchos"] });
		},
	});
}
