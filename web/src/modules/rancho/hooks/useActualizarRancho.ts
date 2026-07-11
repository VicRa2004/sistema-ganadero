import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ranchoService } from "../services/ranchoService";
import type { ActualizarRanchoInput } from "../types";

export function useActualizarRancho(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: ActualizarRanchoInput) =>
			ranchoService.actualizar(id, input),
		onSuccess: (_data) => {
			queryClient.invalidateQueries({ queryKey: ["ranchos"] });
			queryClient.invalidateQueries({ queryKey: ["rancho", id] });
			queryClient.invalidateQueries({ queryKey: ["rancho", id, "capacidad"] });
		},
	});
}
