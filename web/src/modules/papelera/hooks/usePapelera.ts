import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { papeleraService } from "../services/papeleraService";
import type { TipoPapelera } from "../types";

export function useListarPapelera(
	tipo: TipoPapelera,
	page: number,
	limit = 10,
) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: queryKeys.papelera.list(tipo, page),
		queryFn: () => papeleraService.listar(tipo, page, limit),
	});
}

type Elemento = { tipo: TipoPapelera; id: number };

export function useRestaurarElemento() {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Elemento restaurado" },
		mutationFn: ({ tipo, id }: Elemento) => papeleraService.restaurar(tipo, id),
		// Vuelve a aparecer en su módulo (listas, fichas, selectores): se refresca todo
		onSuccess: () => queryClient.invalidateQueries(),
	});
}

export function useEliminarDefinitivo() {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Elemento eliminado definitivamente" },
		mutationFn: ({ tipo, id }: Elemento) =>
			papeleraService.eliminarDefinitivo(tipo, id),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: queryKeys.papelera.all }),
	});
}
