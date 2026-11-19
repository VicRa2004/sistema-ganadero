import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { notificacionService } from "../services/notificacionService";
import type { PreferenciaNotificacionDto, TipoNotificacion } from "../types";

export const NOTIFICACIONES_KEY = queryKeys.notificaciones.lists();
export const PREFERENCIAS_NOTIFICACIONES_KEY =
	queryKeys.notificaciones.preferencias();

export function useListarNotificaciones(params?: {
	page?: number;
	limit?: number;
	soloNoLeidas?: boolean;
	tipo?: TipoNotificacion;
	enabled?: boolean;
}) {
	return useQuery({
		queryKey: [
			...queryKeys.notificaciones.lists(),
			params?.page ?? 1,
			params?.limit ?? 15,
			params?.soloNoLeidas ?? false,
			params?.tipo ?? "",
		],
		queryFn: () => notificacionService.listar(params),
		enabled: params?.enabled ?? true,
		refetchInterval: 60_000,
	});
}

export function useMarcarNotificacionLeida() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => notificacionService.marcarLeida(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.notificaciones.lists(),
			});
		},
	});
}

export function useMarcarTodasLeidas() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => notificacionService.marcarTodasLeidas(),
		meta: { successMessage: "Notificaciones marcadas como leídas" },
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.notificaciones.lists(),
			});
		},
	});
}

export function useEvaluarAlertas() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => notificacionService.evaluarAlertas(),
		meta: { successMessage: "Alertas sanitarias actualizadas" },
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.notificaciones.lists(),
			});
		},
	});
}

export function useObtenerPreferenciasNotificacion() {
	return useQuery({
		queryKey: queryKeys.notificaciones.preferencias(),
		queryFn: () => notificacionService.obtenerPreferencias(),
	});
}

export function useActualizarPreferenciasNotificacion() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (preferencias: PreferenciaNotificacionDto[]) =>
			notificacionService.actualizarPreferencias(preferencias),
		meta: { successMessage: "Preferencias de alertas guardadas" },
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.notificaciones.preferencias(),
			});
		},
	});
}
