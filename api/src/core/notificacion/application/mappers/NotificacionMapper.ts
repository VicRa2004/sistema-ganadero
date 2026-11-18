import { injectable } from "tsyringe";
import type { Notificacion } from "../../domain/Notificacion";
import type { NotificacionOutputDto } from "../dtos/NotificacionDto";

@injectable()
export class NotificacionMapper {
	public toDto(notificacion: Notificacion): NotificacionOutputDto {
		const leidaAt = notificacion.getLeidaAt();
		return {
			id: notificacion.getId(),
			usuarioId: notificacion.getUsuarioId(),
			tipo: notificacion.getTipo(),
			titulo: notificacion.getTitulo(),
			cuerpo: notificacion.getCuerpo(),
			referenciaTipo: notificacion.getReferenciaTipo(),
			referenciaId: notificacion.getReferenciaId(),
			leida: notificacion.estaLeida(),
			leidaAt: leidaAt ? leidaAt.toISOString() : null,
			createdAt: notificacion.getCreatedAt().toISOString(),
		};
	}
}
