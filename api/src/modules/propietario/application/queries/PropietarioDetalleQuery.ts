import type { PropietarioDetalleOutputDto } from "../dtos/PropietarioDto";

export interface PropietarioDetalleQuery {
	/** `usuarioId` restringe la consulta a los propietarios de ese usuario (undefined = sin restricción). */
	obtenerDetalle(
		id: number,
		usuarioId?: number,
	): Promise<PropietarioDetalleOutputDto | null>;
}
