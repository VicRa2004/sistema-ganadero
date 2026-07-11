import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ganadoService } from "../services/ganadoService";

export function useEliminarGanado() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => ganadoService.eliminar(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ganado"] });
		},
	});
}
