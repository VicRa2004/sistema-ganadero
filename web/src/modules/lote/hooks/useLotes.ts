import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { loteService } from "../services/loteService";
import type {
	ActualizarLoteInputDto,
	CrearLoteInputDto,
	LoteFilters,
	PesajeMasivoLoteInputDto,
	TrasladoMasivoLoteInputDto,
	VacunacionMasivaLoteInputDto,
} from "../types";

export function useListarLotes(filters: LoteFilters = {}) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: queryKeys.lotes.list(filters),
		queryFn: () => loteService.listar(filters),
	});
}

export function useObtenerDetalleLote(id: number | null, enabled = true) {
	return useQuery({
		queryKey: queryKeys.lotes.detail(id ?? 0),
		queryFn: () => loteService.obtenerDetalle(id ?? 0),
		enabled: enabled && Boolean(id && id > 0),
	});
}

export function useCrearLote() {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Lote creado correctamente" },
		mutationFn: (input: CrearLoteInputDto) => loteService.crear(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.lotes.lists() });
		},
	});
}

export function useActualizarLote(id: number) {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Lote actualizado" },
		mutationFn: (input: ActualizarLoteInputDto) =>
			loteService.actualizar(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.lotes.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.lotes.detail(id) });
		},
	});
}

export function useEliminarLote() {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Lote eliminado" },
		mutationFn: (id: number) => loteService.eliminar(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.lotes.lists() });
		},
	});
}

export function useAgregarMiembrosLote(id: number) {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Animales agregados al lote" },
		mutationFn: (ganadoIds: number[]) =>
			loteService.agregarMiembros(id, ganadoIds),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.lotes.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.lotes.detail(id) });
		},
	});
}

export function useQuitarMiembroLote(id: number) {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Animal removido del lote" },
		mutationFn: (ganadoId: number) => loteService.quitarMiembro(id, ganadoId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.lotes.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.lotes.detail(id) });
		},
	});
}

export function usePesajeMasivoLote(id: number) {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Pesaje masivo registrado" },
		mutationFn: (input: PesajeMasivoLoteInputDto) =>
			loteService.pesajeMasivo(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.lotes.detail(id) });
			queryClient.invalidateQueries({ queryKey: queryKeys.ganado.lists() });
		},
	});
}

export function useTrasladoMasivoLote(id: number) {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Traslado masivo completado" },
		mutationFn: (input: TrasladoMasivoLoteInputDto) =>
			loteService.trasladoMasivo(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.lotes.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.lotes.detail(id) });
			// Cambia el terreno de varios animales: listas, fichas e historiales
			queryClient.invalidateQueries({ queryKey: queryKeys.ganado.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.terrenos.all });
		},
	});
}

export function useVacunacionMasivaLote(id: number) {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Vacunación masiva registrada" },
		mutationFn: (input: VacunacionMasivaLoteInputDto) =>
			loteService.vacunacionMasiva(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.lotes.detail(id) });
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.all });
			queryClient.invalidateQueries({
				queryKey: queryKeys.sesionesSanitarias.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.dashboard.resumen(),
			});
		},
	});
}
