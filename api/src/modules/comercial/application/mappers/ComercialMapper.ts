import { injectable } from "tsyringe";
import type { Gasto } from "../../domain/Gasto";
import type { Transaccion } from "../../domain/Transaccion";
import type {
	GastoOutputDto,
	TransaccionOutputDto,
} from "../dtos/ComercialDto";

@injectable()
export class ComercialMapper {
	public transaccionToDto(t: Transaccion): TransaccionOutputDto {
		return {
			id: t.getId(),
			tipo: t.getTipo(),
			fecha: t.getFecha().toISOString().slice(0, 10),
			contraparte: t.getContraparte(),
			total: t.getTotal(),
			moneda: t.getMoneda(),
			documento: t.getDocumento(),
			documentoAdjunto: t.getDocumentoAdjunto(),
			observaciones: t.getObservaciones(),
			usuarioId: t.getUsuarioId(),
			detalles: t.getDetalles().map((d) => ({
				id: d.getId(),
				ganadoId: d.getGanadoId(),
				identificador: d.getGanadoIdentificador(),
				precio: d.getPrecio(),
				pesoRegistro: d.getPesoRegistro(),
				procedencia: d.getProcedencia(),
			})),
		};
	}

	public gastoToDto(g: Gasto): GastoOutputDto {
		return {
			id: g.getId(),
			categoria: g.getCategoria(),
			concepto: g.getConcepto(),
			monto: g.getMonto(),
			fecha: g.getFecha().toISOString().slice(0, 10),
			terrenoId: g.getTerrenoId(),
			terrenoNombre: g.getTerrenoNombre(),
			ganadoId: g.getGanadoId(),
			ganadoIdentificador: g.getGanadoIdentificador(),
			loteId: g.getLoteId(),
			loteNombre: g.getLoteNombre(),
			observaciones: g.getObservaciones(),
			usuarioId: g.getUsuarioId(),
		};
	}
}
