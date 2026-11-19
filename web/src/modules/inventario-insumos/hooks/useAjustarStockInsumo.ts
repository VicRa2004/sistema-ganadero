import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { insumoService } from "../services/insumoService";
import type { AjustarStockInput } from "../types";

export function useAjustarStockInsumo(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Ajuste de stock registrado" },
		mutationFn: (input: AjustarStockInput) => insumoService.ajustar(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.detail(id) });
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.criticos() });
			queryClient.invalidateQueries({
				queryKey: queryKeys.insumos.kardexPrefix(id),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.dashboard.resumen(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.alimentacion.autonomia(),
			});
		},
	});
}
