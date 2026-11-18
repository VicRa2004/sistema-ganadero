import type { Pagination } from "@/core/shared/domain/Pagination";
import type { TipoNotificacion } from "../../domain/TipoNotificacion";

export interface NotificacionOutputDto {
	id: number;
	usuarioId: number;
	tipo: TipoNotificacion;
	titulo: string;
	cuerpo: string;
	referenciaTipo: string | null;
	referenciaId: number | null;
	leida: boolean;
	leidaAt: string | null;
	createdAt: string;
}

export interface ListarNotificacionesOutputDto
	extends Pagination<NotificacionOutputDto> {
	noLeidas: number;
}

export interface PreferenciaNotificacionDto {
	tipo: TipoNotificacion;
	inApp: boolean;
	email: boolean;
}

export interface ActualizarPreferenciaInputDto {
	tipo: TipoNotificacion;
	inApp: boolean;
	email?: boolean;
}
