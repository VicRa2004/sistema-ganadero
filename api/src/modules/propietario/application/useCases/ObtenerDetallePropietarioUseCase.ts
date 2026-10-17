import { inject, injectable } from "tsyringe";
import type { Actor } from "@/core/shared/domain/Actor";
import { usuarioIdDeFiltro } from "@/core/shared/domain/Actor";
import { PropietarioNotFoundError } from "../../domain/error/PropietarioNotFoundError";
import type { PropietarioDetalleQuery } from "../queries/PropietarioDetalleQuery";
import type { PropietarioDetalleOutputDto } from "../dtos/PropietarioDto";

@injectable()
export class ObtenerDetallePropietarioUseCase {
	constructor(
		@inject("PropietarioDetalleQuery")
		private readonly query: PropietarioDetalleQuery,
	) {}

	public async run(
		id: number,
		actor: Actor,
	): Promise<PropietarioDetalleOutputDto> {
		const detalle = await this.query.obtenerDetalle(
			id,
			usuarioIdDeFiltro(actor),
		);
		if (!detalle) {
			throw new PropietarioNotFoundError(id);
		}
		return detalle;
	}
}
