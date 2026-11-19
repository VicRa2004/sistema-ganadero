import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { insumoService } from "../services/insumoService";
import type { ActualizarInsumoInput } from "../types";

export function useActualizarInsumo(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Insumo actualizado" },
		mutationFn: (input: ActualizarInsumoInput) =>
			insumoService.actualizar(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.criticos() });
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.detail(id) });
			queryClient.invalidateQueries({
				queryKey: queryKeys.alimentacion.autonomia(),
			});
		},
	});
}
