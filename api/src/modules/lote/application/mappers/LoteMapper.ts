import { injectable } from "tsyringe";
import type { Lote } from "../../domain/Lote";
import type { LoteDetailRecord } from "../../domain/repository/LoteRepository";
import type { LoteDetalleOutputDto, LoteOutputDto } from "../dtos/LoteDto";

@injectable()
export class LoteMapper {
	public toDto(lote: Lote): LoteOutputDto {
		return {
			id: lote.getId(),
			nombre: lote.getNombre(),
			proposito: lote.getProposito(),
			descripcion: lote.getDescripcion(),
			terrenoId: lote.getTerrenoId(),
			terrenoNombre: lote.getTerrenoNombre(),
			activo: lote.esActivo(),
			usuarioId: lote.getUsuarioId(),
			cantidadAnimales: lote.getCantidadAnimales(),
		};
	}

	public toDetalleDto(detail: LoteDetailRecord): LoteDetalleOutputDto {
		return {
			...this.toDto(detail.lote),
			miembros: detail.miembros,
		};
	}
}
