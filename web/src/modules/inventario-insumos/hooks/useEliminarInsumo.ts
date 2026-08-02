import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insumoService } from "../services/insumoService";

export function useEliminarInsumo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => insumoService.eliminar(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["insumos"] });
		},
	});
}
