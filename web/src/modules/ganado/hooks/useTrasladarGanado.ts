import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ganadoService } from "../services/ganadoService";
import type { TrasladarGanadoInput } from "../types";

export function useTrasladarGanado(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Ganado trasladado" },
		mutationFn: (input: TrasladarGanadoInput) =>
			ganadoService.trasladar(id, input),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.ganado.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.ganado.detail(id) });
			queryClient.invalidateQueries({
				queryKey: queryKeys.ganado.traslados(id),
			});
			if (data?.identificador) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.ganado.detail(data.identificador),
				});
			}
			queryClient.invalidateQueries({ queryKey: queryKeys.terrenos.all });
		},
	});
}
