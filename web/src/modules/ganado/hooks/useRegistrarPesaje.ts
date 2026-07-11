import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ganadoService } from "../services/ganadoService";
import type { RegistrarPesajeInput } from "../types";

export function useRegistrarPesaje(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: RegistrarPesajeInput) =>
			ganadoService.registrarPesaje(id, input),
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
