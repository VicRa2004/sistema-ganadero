import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ranchoService } from "../services/ranchoService";

export function useEliminarRancho() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => ranchoService.eliminar(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ranchos"] });
		},
	});
}
