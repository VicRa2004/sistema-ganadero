import { injectable } from "tsyringe";
import type { Insumo } from "../../domain/Insumo";
import type { InsumoOutputDto } from "../dtos/InsumoDto";

@injectable()
export class InsumoMapper {
	public toDto(insumo: Insumo): InsumoOutputDto {
		return {
			id: insumo.getId(),
			nombre: insumo.getNombre(),
			tipo: insumo.getTipo(),
			stock: insumo.getStock(),
			stockMinimo: insumo.getStockMinimo(),
			unidadMedida: insumo.getUnidadMedida(),
			lote: insumo.getLote(),
			fechaCaducidad: insumo.getFechaCaducidad().toISOString(),
			esBajoStock: insumo.esBajoStock(),
		};
	}
}
