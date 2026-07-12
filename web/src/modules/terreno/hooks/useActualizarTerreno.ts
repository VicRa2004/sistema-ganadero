import { useMutation, useQueryClient } from "@tanstack/react-query";
import { terrenoService } from "../services/terrenoService";
import type { ActualizarTerrenoInput } from "../types";

export function useActualizarTerreno(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: ActualizarTerrenoInput) =>
			terrenoService.actualizar(id, input),
		onSuccess: (_data) => {
			queryClient.invalidateQueries({ queryKey: ["terrenos"] });
			queryClient.invalidateQueries({ queryKey: ["terreno", id] });
			queryClient.invalidateQueries({ queryKey: ["terreno", id, "capacidad"] });
		},
	});
}
