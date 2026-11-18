import { api } from "@/config/axios";
import type {
	ListarNotificacionesResponse,
	NotificacionDto,
	PreferenciaNotificacionDto,
	TipoNotificacion,
} from "../types";

export const notificacionService = {
	async listar(params?: {
		page?: number;
		limit?: number;
		soloNoLeidas?: boolean;
		tipo?: TipoNotificacion;
	}): Promise<ListarNotificacionesResponse> {
		const { data } = await api.get<ListarNotificacionesResponse>(
			"/notificaciones",
			{
				params: {
					page: params?.page ?? 1,
					limit: params?.limit ?? 15,
					soloNoLeidas: params?.soloNoLeidas ? "true" : "false",
					tipo: params?.tipo,
				},
			},
		);
		return data;
	},

	async marcarLeida(id: number): Promise<NotificacionDto> {
		const { data } = await api.post<NotificacionDto>(
			`/notificaciones/${id}/leer`,
		);
		return data;
	},

	async marcarTodasLeidas(): Promise<{ actualizadas: number }> {
		const { data } = await api.post<{ actualizadas: number }>(
			"/notificaciones/leer-todas",
		);
		return data;
	},

	async obtenerPreferencias(): Promise<PreferenciaNotificacionDto[]> {
		const { data } = await api.get<PreferenciaNotificacionDto[]>(
			"/notificaciones/preferencias",
		);
		return data;
	},

	async actualizarPreferencias(
		preferencias: PreferenciaNotificacionDto[],
	): Promise<PreferenciaNotificacionDto[]> {
		const { data } = await api.put<PreferenciaNotificacionDto[]>(
			"/notificaciones/preferencias",
			{ preferencias },
		);
		return data;
	},

	async evaluarAlertas(): Promise<{
		eventosEmitidos: number;
		sesionesGeneradasPorPlanes: number;
	}> {
		const { data } = await api.post<{
			eventosEmitidos: number;
			sesionesGeneradasPorPlanes: number;
		}>("/salud/evaluar-alertas");
		return data;
	},
};
