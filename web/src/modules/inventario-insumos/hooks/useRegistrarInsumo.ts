import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insumoService } from "../services/insumoService";
import type { RegistrarInsumoInput } from "../types";

export function useRegistrarInsumo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: RegistrarInsumoInput) => insumoService.registrar(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["insumos"] });
		},
	});
}
