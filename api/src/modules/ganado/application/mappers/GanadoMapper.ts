import { injectable } from "tsyringe";
import type { Ganado } from "../../domain/Ganado";
import type { GanadoOutputDto } from "../dtos/GanadoDto";

@injectable()
export class GanadoMapper {
	public toDto(ganado: Ganado): GanadoOutputDto {
		return {
			id: ganado.getId(),
			identificador: ganado.getIdentificador(),
			peso: ganado.getPeso(),
			edadEnMeses: ganado.getEdadEnMeses(),
			sexo: ganado.getSexo(),
			razaId: ganado.getRazaId(),
			terrenoId: ganado.getTerrenoId(),
			propietarioId: ganado.getPropietarioId(),
		};
	}
}
