import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ganadoService } from "../services/ganadoService";
import type { DarDeBajaGanadoInput } from "../types";

export function useDarDeBajaGanado(ganadoId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Ganado dado de baja" },
		mutationFn: (input: DarDeBajaGanadoInput) =>
			ganadoService.darDeBaja(ganadoId, input),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.ganado.lists() });
			queryClient.invalidateQueries({
				queryKey: queryKeys.ganado.detail(ganadoId),
			});
			if (data?.identificador) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.ganado.detail(data.identificador),
				});
			}
			queryClient.invalidateQueries({ queryKey: queryKeys.terrenos.all });
			queryClient.invalidateQueries({
				queryKey: queryKeys.dashboard.resumen(),
			});
		},
	});
}
