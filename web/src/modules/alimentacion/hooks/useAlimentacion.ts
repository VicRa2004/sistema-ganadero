import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { alimentacionService } from "../services/alimentacionService";
import type {
	ActualizarRacionInputDto,
	CrearRacionInputDto,
	RacionFilters,
	RegistrarSuministroInputDto,
	SuministroFilters,
} from "../types";

export function useObtenerAutonomiaAlimento() {
	return useQuery({
		queryKey: queryKeys.alimentacion.autonomia(),
		queryFn: () => alimentacionService.obtenerAutonomia(),
	});
}

export function useListarRaciones(filters: RacionFilters = {}) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: queryKeys.alimentacion.raciones(filters),
		queryFn: () => alimentacionService.listarRaciones(filters),
	});
}

export function useListarSuministros(filters: SuministroFilters = {}) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: queryKeys.alimentacion.suministros(filters),
		queryFn: () => alimentacionService.listarSuministros(filters),
	});
}

export function useCrearRacion() {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Ración creada correctamente" },
		mutationFn: (input: CrearRacionInputDto) =>
			alimentacionService.crearRacion(input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.alimentacion.racionesAll(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.alimentacion.autonomia(),
			});
		},
	});
}

export function useActualizarRacion() {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Ración actualizada" },
		mutationFn: ({
			id,
			input,
		}: {
			id: number;
			input: ActualizarRacionInputDto;
		}) => alimentacionService.actualizarRacion(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.alimentacion.racionesAll(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.alimentacion.autonomia(),
			});
		},
	});
}

export function useEliminarRacion() {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Ración eliminada" },
		mutationFn: (id: number) => alimentacionService.eliminarRacion(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.alimentacion.racionesAll(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.alimentacion.autonomia(),
			});
		},
	});
}

export function useRegistrarSuministro(racionId: number) {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Suministro de ración registrado" },
		mutationFn: (input: RegistrarSuministroInputDto) =>
			alimentacionService.registrarSuministro(racionId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.alimentacion.suministrosAll(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.alimentacion.autonomia(),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.all });
			queryClient.invalidateQueries({
				queryKey: queryKeys.notificaciones.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.dashboard.resumen(),
			});
		},
	});
}
