import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ganadoService } from "../services/ganadoService";
import type { TrasladarGanadoInput } from "../types";

export function useTrasladarGanado(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: TrasladarGanadoInput) =>
			ganadoService.trasladar(id, input),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["ganado"] });
			queryClient.invalidateQueries({ queryKey: ["ganado", "ficha", id] });
			if (data?.identificador) {
				queryClient.invalidateQueries({
					queryKey: ["ganado", "ficha", data.identificador],
				});
			}
		},
	});
}
