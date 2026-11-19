import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ganadoService } from "../services/ganadoService";

export function useEliminarGanado() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Ganado eliminado" },
		mutationFn: (id: number) => ganadoService.eliminar(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.ganado.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.terrenos.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.lotes.all });
			queryClient.invalidateQueries({
				queryKey: queryKeys.dashboard.resumen(),
			});
		},
	});
}
