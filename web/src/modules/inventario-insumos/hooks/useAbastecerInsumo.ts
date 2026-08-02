import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insumoService } from "../services/insumoService";
import type { AbastecerInsumoInput } from "../types";

export function useAbastecerInsumo(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: AbastecerInsumoInput) =>
			insumoService.abastecer(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["insumos"] });
		},
	});
}
