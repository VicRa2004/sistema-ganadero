import { useMutation, useQueryClient } from "@tanstack/react-query";
import { terrenoService } from "../services/terrenoService";
import type { RegistrarTerrenoInput } from "../types";

export function useRegistrarTerreno() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: RegistrarTerrenoInput) =>
			terrenoService.registrar(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["terrenos"] });
		},
	});
}
