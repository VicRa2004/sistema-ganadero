import type { PropietarioDetalleOutputDto } from "../dtos/PropietarioDto";

export interface PropietarioDetalleQuery {
	obtenerDetalle(id: number): Promise<PropietarioDetalleOutputDto | null>;
}
