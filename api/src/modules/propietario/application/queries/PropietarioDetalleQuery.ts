import type { Actor } from "@/core/shared/domain/Actor";
import type { PropietarioDetalleOutputDto } from "../dtos/PropietarioDto";

export interface PropietarioDetalleQuery {
	/** Restringe la consulta a los propietarios accesibles por `actor`. */
	obtenerDetalle(
		id: number,
		actor: Actor,
	): Promise<PropietarioDetalleOutputDto | null>;
}
