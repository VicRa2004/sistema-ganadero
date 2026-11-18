import type { TipoNotificacion } from "../TipoNotificacion";

export interface NotificacionFilters {
	page: number;
	limit: number;
	usuarioId: number;
	soloNoLeidas?: boolean;
	tipo?: TipoNotificacion;
}
