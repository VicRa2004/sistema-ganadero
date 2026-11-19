import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { sesionSanitariaService } from "../services/sesionSanitariaService";
import type { CrearPlanSanitarioInput } from "../types";

export const CALENDARIO_SANITARIO_KEY =
	queryKeys.sesionesSanitarias.calendarioAll();
export const PLANES_SANITARIOS_KEY = queryKeys.sesionesSanitarias.planes();

export function useObtenerCalendarioSanitario(params: {
	desde: string;
	hasta: string;
	terrenoId?: number;
	ganadoId?: number;
}) {
	return useQuery({
		queryKey: queryKeys.sesionesSanitarias.calendario(params),
		queryFn: () => sesionSanitariaService.obtenerCalendario(params),
	});
}

export function useRealizarSesionSanitaria() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => sesionSanitariaService.realizar(id),
		meta: { successMessage: "Sesión marcada como realizada" },
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.sesionesSanitarias.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.sesionesSanitarias.detail(id),
			});
			queryClient.invalidateQueries({ queryKey: CALENDARIO_SANITARIO_KEY });
			queryClient.invalidateQueries({ queryKey: queryKeys.insumos.all });
			queryClient.invalidateQueries({
				queryKey: queryKeys.notificaciones.lists(),
			});
		},
	});
}

export function useCancelarSesionSanitaria() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => sesionSanitariaService.cancelar(id),
		meta: { successMessage: "Sesión cancelada" },
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.sesionesSanitarias.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.sesionesSanitarias.detail(id),
			});
			queryClient.invalidateQueries({ queryKey: CALENDARIO_SANITARIO_KEY });
		},
	});
}

export function useListarPlanesSanitarios() {
	return useQuery({
		queryKey: PLANES_SANITARIOS_KEY,
		queryFn: () => sesionSanitariaService.listarPlanes(),
	});
}

export function useCrearPlanSanitario() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CrearPlanSanitarioInput) =>
			sesionSanitariaService.crearPlan(input),
		meta: { successMessage: "Plan sanitario creado correctamente" },
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PLANES_SANITARIOS_KEY });
		},
	});
}

export function useActualizarPlanSanitario() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			input,
		}: {
			id: number;
			input: Partial<CrearPlanSanitarioInput>;
		}) => sesionSanitariaService.actualizarPlan(id, input),
		meta: { successMessage: "Plan sanitario actualizado" },
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PLANES_SANITARIOS_KEY });
		},
	});
}

export function useEliminarPlanSanitario() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => sesionSanitariaService.eliminarPlan(id),
		meta: { successMessage: "Plan sanitario eliminado" },
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PLANES_SANITARIOS_KEY });
		},
	});
}

export function useGenerarSesionesPlanes() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => sesionSanitariaService.generarSesionesPlanes(),
		meta: { successMessage: "Sesiones generadas desde planes activos" },
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PLANES_SANITARIOS_KEY });
			queryClient.invalidateQueries({
				queryKey: queryKeys.sesionesSanitarias.lists(),
			});
			queryClient.invalidateQueries({ queryKey: CALENDARIO_SANITARIO_KEY });
			queryClient.invalidateQueries({
				queryKey: queryKeys.notificaciones.lists(),
			});
		},
	});
}
