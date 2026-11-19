import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { insumoService } from "../services/insumoService";
import type { RegistrarInsumoInput } from "../types";

export function useRegistrarInsumo() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Insumo registrado" },
		mutationFn: (input: RegistrarInsumoInput) => insumoService.registrar(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.criticos() });
			queryClient.invalidateQueries({
				queryKey: queryKeys.alimentacion.autonomia(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.dashboard.resumen(),
			});
		},
	});
}
