import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ganadoService } from "../services/ganadoService";

export function usePrevisualizarImportacionGanado() {
	return useMutation({
		mutationFn: (csv: string) => ganadoService.previsualizarImportacion(csv),
	});
}

export function useConfirmarImportacionGanado() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (csv: string) => ganadoService.confirmarImportacion(csv),
		meta: { successMessage: "Ganado importado correctamente" },
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ganado"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
		},
	});
}
