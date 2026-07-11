import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ganadoService } from "../services/ganadoService";
import type { ActualizarGanadoInput } from "../types";

export function useActualizarGanado(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: ActualizarGanadoInput) =>
			ganadoService.actualizar(id, input),
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
