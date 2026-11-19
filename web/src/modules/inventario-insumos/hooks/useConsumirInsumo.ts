import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { insumoService } from "../services/insumoService";
import type { ConsumirInsumoInput } from "../types";

export function useConsumirInsumo(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Consumo registrado" },
		mutationFn: (input: ConsumirInsumoInput) =>
			insumoService.consumir(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.criticos() });
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.detail(id) });
			queryClient.invalidateQueries({
				queryKey: queryKeys.insumos.kardexPrefix(id),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.alimentacion.autonomia(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.dashboard.resumen(),
			});
		},
	});
}
