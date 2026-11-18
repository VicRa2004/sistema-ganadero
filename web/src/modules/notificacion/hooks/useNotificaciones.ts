import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificacionService } from "../services/notificacionService";
import type { PreferenciaNotificacionDto, TipoNotificacion } from "../types";

export const NOTIFICACIONES_KEY = ["notificaciones"] as const;
export const PREFERENCIAS_NOTIFICACIONES_KEY = [
	"notificaciones-preferencias",
] as const;

export function useListarNotificaciones(params?: {
	page?: number;
	limit?: number;
	soloNoLeidas?: boolean;
	tipo?: TipoNotificacion;
	enabled?: boolean;
}) {
	return useQuery({
		queryKey: [
			...NOTIFICACIONES_KEY,
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
			queryClient.invalidateQueries({ queryKey: NOTIFICACIONES_KEY });
		},
	});
}

export function useMarcarTodasLeidas() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => notificacionService.marcarTodasLeidas(),
		meta: { successMessage: "Notificaciones marcadas como leídas" },
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: NOTIFICACIONES_KEY });
		},
	});
}

export function useEvaluarAlertas() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => notificacionService.evaluarAlertas(),
		meta: { successMessage: "Alertas sanitarias actualizadas" },
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: NOTIFICACIONES_KEY });
		},
	});
}

export function useObtenerPreferenciasNotificacion() {
	return useQuery({
		queryKey: PREFERENCIAS_NOTIFICACIONES_KEY,
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
				queryKey: PREFERENCIAS_NOTIFICACIONES_KEY,
			});
		},
	});
}
