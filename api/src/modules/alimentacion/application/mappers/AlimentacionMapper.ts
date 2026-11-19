import { injectable } from "tsyringe";
import type { RacionAlimentacion } from "../../domain/RacionAlimentacion";
import type { SuministroRacion } from "../../domain/SuministroRacion";
import type {
	RacionOutputDto,
	SuministroOutputDto,
} from "../dtos/AlimentacionDto";

@injectable()
export class AlimentacionMapper {
	public racionToDto(r: RacionAlimentacion): RacionOutputDto {
		return {
			id: r.getId(),
			nombre: r.getNombre(),
			insumoId: r.getInsumoId(),
			insumoNombre: r.getInsumoNombre(),
			insumoUnidad: r.getInsumoUnidad(),
			terrenoId: r.getTerrenoId(),
			terrenoNombre: r.getTerrenoNombre(),
			loteId: r.getLoteId(),
			loteNombre: r.getLoteNombre(),
			cantidadDiariaPorAnimal: r.getCantidadDiariaPorAnimal(),
			diasAlertaAutonomia: r.getDiasAlertaAutonomia(),
			activo: r.esActivo(),
			observaciones: r.getObservaciones(),
			usuarioId: r.getUsuarioId(),
		};
	}

	public suministroToDto(s: SuministroRacion): SuministroOutputDto {
		return {
			id: s.getId(),
			racionId: s.getRacionId(),
			racionNombre: s.getRacionNombre(),
			insumoId: s.getInsumoId(),
			insumoNombre: s.getInsumoNombre(),
			insumoUnidad: s.getInsumoUnidad(),
			terrenoId: s.getTerrenoId(),
			loteId: s.getLoteId(),
			fecha: s.getFecha().toISOString(),
			cantidadAnimales: s.getCantidadAnimales(),
			cantidadTotal: s.getCantidadTotal(),
			costoTotal: s.getCostoTotal(),
			observaciones: s.getObservaciones(),
			usuarioId: s.getUsuarioId(),
		};
	}
}
