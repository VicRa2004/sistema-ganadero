import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insumoService } from "../services/insumoService";

export function useEliminarInsumo() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Insumo eliminado" },
		mutationFn: (id: number) => insumoService.eliminar(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["insumos"] });
		},
	});
}
