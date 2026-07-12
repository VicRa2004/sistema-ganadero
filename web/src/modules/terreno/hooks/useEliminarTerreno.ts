import { useMutation, useQueryClient } from "@tanstack/react-query";
import { terrenoService } from "../services/terrenoService";

export function useEliminarTerreno() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => terrenoService.eliminar(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["terrenos"] });
		},
	});
}
