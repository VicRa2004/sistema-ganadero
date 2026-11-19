import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { terrenoService } from "../services/terrenoService";
import type { ActualizarTerrenoInput } from "../types";

export function useActualizarTerreno(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Terreno actualizado" },
		mutationFn: (input: ActualizarTerrenoInput) =>
			terrenoService.actualizar(id, input),
		onSuccess: (_data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.terrenos.lists() });
			queryClient.invalidateQueries({
				queryKey: queryKeys.terrenos.detail(id),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.terrenos.capacidad(id),
			});
		},
	});
}
