import { injectable } from "tsyringe";
import type { MovimientoInsumo } from "../../domain/MovimientoInsumo";
import type { MovimientoInsumoOutputDto } from "../dtos/InsumoDto";

@injectable()
export class MovimientoInsumoMapper {
	public toDto(mov: MovimientoInsumo): MovimientoInsumoOutputDto {
		return {
			id: mov.getId(),
			insumoId: mov.getInsumoId(),
			tipo: mov.getTipo(),
			cantidad: mov.getCantidad(),
			delta: mov.getDelta(),
			costoUnitario: mov.getCostoUnitario(),
			motivo: mov.getMotivo(),
			referenciaTipo: mov.getReferenciaTipo(),
			referenciaId: mov.getReferenciaId(),
			ganadoId: mov.getGanadoId(),
			terrenoId: mov.getTerrenoId(),
			loteId: mov.getLoteId(),
			usuarioId: mov.getUsuarioId(),
			fecha: mov.getFecha().toISOString(),
		};
	}
}
