import { injectable } from "tsyringe";
import type {
	TratamientoMedico,
	TratamientoMedicoRelaciones,
} from "../../domain/TratamientoMedico";
import type { TratamientoMedicoOutputDto } from "../dtos/TratamientoMedicoDto";

@injectable()
export class TratamientoMedicoMapper {
	public toDto(
		tratamiento: TratamientoMedico,
		detallesExtra?: TratamientoMedicoRelaciones,
	): TratamientoMedicoOutputDto {
		const rel = tratamiento.getRelaciones();
		const createdAt = detallesExtra?.createdAt ?? rel?.createdAt;
		const updatedAt = detallesExtra?.updatedAt ?? rel?.updatedAt;

		return {
			id: tratamiento.esNuevo() ? 0 : tratamiento.getId(),
			ganadoId: tratamiento.getGanadoId(),
			ganadoIdentificador:
				detallesExtra?.ganadoIdentificador ?? rel?.ganadoIdentificador,
			diagnostico: tratamiento.getDiagnostico(),
			fechaInicio: tratamiento.getFechaInicio().toISOString(),
			fechaFin: tratamiento.getFechaFin().toISOString(),
			activo: tratamiento.esActivo(),
			insumoId: tratamiento.getInsumoId(),
			insumoNombre: detallesExtra?.insumoNombre ?? rel?.insumoNombre,
			insumoUnidad: detallesExtra?.insumoUnidad ?? rel?.insumoUnidad,
			dosisDiaria: tratamiento.getDosisDiaria(),
			veterinarioId: tratamiento.getVeterinarioId(),
			veterinarioNombre:
				detallesExtra?.veterinarioNombre ?? rel?.veterinarioNombre,
			createdAt: createdAt ? createdAt.toISOString() : undefined,
			updatedAt: updatedAt ? updatedAt.toISOString() : undefined,
		};
	}
}
