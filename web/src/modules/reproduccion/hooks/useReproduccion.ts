import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reproduccionService } from "../services/reproduccionService";
import type {
	EventoReproductivoFilters,
	RegistrarEventoReproductivoInput,
} from "../types";

export function useListarEventosReproductivos(
	filters: EventoReproductivoFilters,
	enabled = true,
) {
	return useQuery({
		queryKey: ["reproduccion", "eventos", filters],
		queryFn: () => reproduccionService.listar(filters),
		enabled,
	});
}

export function useIndicadoresReproductivos(params?: {
	desde?: string;
	hasta?: string;
}) {
	return useQuery({
		queryKey: ["reproduccion", "indicadores", params],
		queryFn: () => reproduccionService.obtenerIndicadores(params),
	});
}

export function useRegistrarEventoReproductivo() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: RegistrarEventoReproductivoInput) =>
			reproduccionService.registrar(input),
		meta: { successMessage: "Evento reproductivo registrado" },
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reproduccion"] });
			queryClient.invalidateQueries({ queryKey: ["ganado"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
		},
	});
}

export function useEliminarEventoReproductivo() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => reproduccionService.eliminar(id),
		meta: { successMessage: "Evento reproductivo eliminado" },
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reproduccion"] });
		},
	});
}
