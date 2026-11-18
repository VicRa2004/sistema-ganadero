import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sesionSanitariaService } from "../services/sesionSanitariaService";
import type { CrearPlanSanitarioInput } from "../types";

export const CALENDARIO_SANITARIO_KEY = ["calendario-sanitario"] as const;
export const PLANES_SANITARIOS_KEY = ["planes-sanitarios"] as const;

export function useObtenerCalendarioSanitario(params: {
	desde: string;
	hasta: string;
	terrenoId?: number;
	ganadoId?: number;
}) {
	return useQuery({
		queryKey: [
			...CALENDARIO_SANITARIO_KEY,
			params.desde,
			params.hasta,
			params.terrenoId ?? "",
			params.ganadoId ?? "",
		],
		queryFn: () => sesionSanitariaService.obtenerCalendario(params),
	});
}

export function useRealizarSesionSanitaria() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => sesionSanitariaService.realizar(id),
		meta: { successMessage: "Sesión marcada como realizada" },
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sesiones-sanitarias"] });
			queryClient.invalidateQueries({ queryKey: CALENDARIO_SANITARIO_KEY });
			queryClient.invalidateQueries({ queryKey: ["insumos"] });
			queryClient.invalidateQueries({ queryKey: ["notificaciones"] });
		},
	});
}

export function useCancelarSesionSanitaria() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => sesionSanitariaService.cancelar(id),
		meta: { successMessage: "Sesión cancelada" },
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sesiones-sanitarias"] });
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
			queryClient.invalidateQueries({ queryKey: ["sesiones-sanitarias"] });
			queryClient.invalidateQueries({ queryKey: CALENDARIO_SANITARIO_KEY });
			queryClient.invalidateQueries({ queryKey: ["notificaciones"] });
		},
	});
}
