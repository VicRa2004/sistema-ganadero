import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { insumoService } from "../services/insumoService";
import type { AbastecerInsumoInput } from "../types";

export function useAbastecerInsumo(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Insumo abastecido" },
		mutationFn: (input: AbastecerInsumoInput) =>
			insumoService.abastecer(id, input),
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
