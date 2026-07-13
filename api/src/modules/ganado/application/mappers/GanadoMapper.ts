import { injectable } from "tsyringe";
import type { Ganado } from "../../domain/Ganado";
import type { MotivoBaja } from "../../domain/MotivoBaja";
import type { GanadoOutputDto, MotivoBajaOutputDto } from "../dtos/GanadoDto";

@injectable()
export class GanadoMapper {
	public toDto(ganado: Ganado): GanadoOutputDto {
		return {
			id: ganado.getId(),
			identificador: ganado.getIdentificador(),
			peso: ganado.getPeso(),
			fechaNacimiento:
				ganado.getFechaNacimiento().toISOString().split("T")[0] ?? "",
			sexo: ganado.getSexo(),
			imagenGanado: ganado.getImagenGanado(),
			razaId: ganado.getRazaId(),
			terrenoId: ganado.getTerrenoId(),
			propietarioId: ganado.getPropietarioId(),
			padreId: ganado.getPadreId(),
			madreId: ganado.getMadreId(),
			fechaBaja: ganado.getFechaBaja()?.toISOString() ?? null,
			motivoBajaId: ganado.getMotivoBajaId(),
		};
	}

	public motivoBajaToDto(motivo: MotivoBaja): MotivoBajaOutputDto {
		return {
			id: motivo.getId(),
			nombre: motivo.getNombre(),
			descripcion: motivo.getDescripcion(),
		};
	}
}
