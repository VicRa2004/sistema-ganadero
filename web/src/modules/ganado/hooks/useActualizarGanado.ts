import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ganadoService } from "../services/ganadoService";
import type { ActualizarGanadoInput } from "../types";

export function useActualizarGanado(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Ganado actualizado" },
		mutationFn: (input: ActualizarGanadoInput) =>
			ganadoService.actualizar(id, input),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.ganado.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.ganado.detail(id) });
			if (data?.identificador) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.ganado.detail(data.identificador),
				});
			}
			queryClient.invalidateQueries({ queryKey: queryKeys.ganado.pesajes(id) });
			queryClient.invalidateQueries({ queryKey: queryKeys.terrenos.all });
		},
	});
}
