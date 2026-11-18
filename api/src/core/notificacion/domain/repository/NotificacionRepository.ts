import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Notificacion } from "../Notificacion";
import type { TipoNotificacion } from "../TipoNotificacion";
import type { NotificacionFilters } from "./NotificacionFilters";

export interface PreferenciaNotificacionItem {
	tipo: TipoNotificacion;
	inApp: boolean;
	email: boolean;
}

export interface NotificacionRepository {
	findByUsuario(
		filters: NotificacionFilters,
	): Promise<Pagination<Notificacion>>;
	countNoLeidas(usuarioId: number): Promise<number>;
	saveIfNotExists(notificacion: Notificacion): Promise<Notificacion | null>;
	marcarLeida(id: number, usuarioId: number): Promise<Notificacion | null>;
	marcarTodasLeidas(usuarioId: number): Promise<number>;
	getPreferencias(usuarioId: number): Promise<PreferenciaNotificacionItem[]>;
	upsertPreferencia(
		usuarioId: number,
		tipo: TipoNotificacion,
		inApp: boolean,
		email: boolean,
	): Promise<PreferenciaNotificacionItem>;
}
