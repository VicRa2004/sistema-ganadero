import { injectable } from "tsyringe";
import type { Propietario } from "../../domain/Propietario";
import type { PropietarioOutputDto } from "../dtos/PropietarioDto";

@injectable()
export class PropietarioMapper {
	public toDto(propietario: Propietario): PropietarioOutputDto {
		return {
			id: propietario.getId(),
			nombre: propietario.getNombre(),
			telefono: propietario.getTelefono(),
			correo: propietario.getCorreo(),
		};
	}
}
