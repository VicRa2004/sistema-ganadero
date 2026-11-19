import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ganadoService } from "../services/ganadoService";
import type { RegistrarPesajeInput } from "../types";

export function useRegistrarPesaje(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Pesaje registrado" },
		mutationFn: (input: RegistrarPesajeInput) =>
			ganadoService.registrarPesaje(id, input),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.ganado.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.ganado.detail(id) });
			queryClient.invalidateQueries({ queryKey: queryKeys.ganado.pesajes(id) });
			if (data?.identificador) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.ganado.detail(data.identificador),
				});
			}
		},
	});
}
