import { inject, injectable } from "tsyringe";
import { PropietarioNotFoundError } from "../../domain/error/PropietarioNotFoundError";
import type { PropietarioDetalleQuery } from "../queries/PropietarioDetalleQuery";
import type { PropietarioDetalleOutputDto } from "../dtos/PropietarioDto";

@injectable()
export class ObtenerDetallePropietarioUseCase {
	constructor(
		@inject("PropietarioDetalleQuery")
		private readonly query: PropietarioDetalleQuery,
	) {}

	public async run(id: number): Promise<PropietarioDetalleOutputDto> {
		const detalle = await this.query.obtenerDetalle(id);
		if (!detalle) {
			throw new PropietarioNotFoundError(id);
		}
		return detalle;
	}
}
