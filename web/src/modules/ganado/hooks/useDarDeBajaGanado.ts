import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ganadoService } from "../services/ganadoService";
import type { DarDeBajaGanadoInput } from "../types";

export function useDarDeBajaGanado(ganadoId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: DarDeBajaGanadoInput) =>
			ganadoService.darDeBaja(ganadoId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ganados"] });
			queryClient.invalidateQueries({ queryKey: ["ganado", ganadoId] });
		},
	});
}
