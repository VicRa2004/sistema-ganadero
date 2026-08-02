import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insumoService } from "../services/insumoService";
import type { ActualizarInsumoInput } from "../types";

export function useActualizarInsumo(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: ActualizarInsumoInput) =>
			insumoService.actualizar(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["insumos"] });
		},
	});
}
