import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { terrenoService } from "../services/terrenoService";
import type { RegistrarTerrenoInput } from "../types";

export function useRegistrarTerreno() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Terreno registrado" },
		mutationFn: (input: RegistrarTerrenoInput) =>
			terrenoService.registrar(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.terrenos.lists() });
		},
	});
}
