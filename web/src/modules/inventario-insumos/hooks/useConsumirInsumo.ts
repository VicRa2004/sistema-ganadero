import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insumoService } from "../services/insumoService";
import type { ConsumirInsumoInput } from "../types";

export function useConsumirInsumo(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: ConsumirInsumoInput) =>
			insumoService.consumir(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["insumos"] });
		},
	});
}
