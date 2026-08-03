import { injectable } from "tsyringe";
import type { AplicacionSanitaria } from "../../domain/AplicacionSanitaria";
import type { SesionSanitaria } from "../../domain/SesionSanitaria";
import type {
	AplicacionSanitariaOutputDto,
	SesionSanitariaOutputDto,
} from "../dtos/SesionSanitariaDto";

@injectable()
export class SesionSanitariaMapper {
	public toAplicacionDto(
		app: AplicacionSanitaria,
		identificadorGanado?: string,
		createdAt?: Date,
	): AplicacionSanitariaOutputDto {
		return {
			id: app.getId() ?? 0,
			sesionId: app.getSesionId() ?? 0,
			ganadoId: app.getGanadoId(),
			identificadorGanado,
			dosisAplicada: app.getDosisAplicada(),
			observaciones: app.getObservaciones(),
			createdAt: createdAt ? createdAt.toISOString() : undefined,
		};
	}

	public toDto(
		sesion: SesionSanitaria,
		detallesExtra?: {
			nombreVeterinario?: string;
			nombreInsumo?: string;
			unidadMedidaInsumo?: string;
			mapeoIdentificadoresGanado?: Record<number, string>;
			createdAt?: Date;
		},
	): SesionSanitariaOutputDto {
		const aplicaciones = sesion.getAplicaciones().map((app) => {
			const identificador =
				detallesExtra?.mapeoIdentificadoresGanado?.[app.getGanadoId()];
			return this.toAplicacionDto(app, identificador);
		});

		return {
			id: sesion.getId() ?? 0,
			fecha: sesion.getFecha().toISOString(),
			veterinarioId: sesion.getVeterinarioId(),
			nombreVeterinario: detallesExtra?.nombreVeterinario,
			descripcion: sesion.getDescripcion(),
			insumoId: sesion.getInsumoId(),
			nombreInsumo: detallesExtra?.nombreInsumo,
			unidadMedidaInsumo: detallesExtra?.unidadMedidaInsumo,
			totalDosisAplicadas: sesion.calcularTotalDosisConsumida(),
			totalAnimales: aplicaciones.length,
			aplicaciones,
			createdAt: detallesExtra?.createdAt
				? detallesExtra.createdAt.toISOString()
				: undefined,
		};
	}
}
