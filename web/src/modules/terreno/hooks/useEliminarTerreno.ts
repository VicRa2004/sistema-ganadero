import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { terrenoService } from "../services/terrenoService";

export function useEliminarTerreno() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Terreno eliminado" },
		mutationFn: (id: number) => terrenoService.eliminar(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.terrenos.lists() });
		},
	});
}
