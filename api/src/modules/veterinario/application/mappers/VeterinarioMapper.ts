import { injectable } from "tsyringe";
import type { Veterinario } from "../../domain/Veterinario";
import type { VeterinarioOutputDto } from "../dtos/VeterinarioDto";

@injectable()
export class VeterinarioMapper {
	public toDto(veterinario: Veterinario): VeterinarioOutputDto {
		return {
			id: veterinario.getId(),
			nombre: veterinario.getNombre(),
			telefono: veterinario.getTelefono(),
			cedulaProfesional: veterinario.getCedulaProfesional(),
			especialidad: veterinario.getEspecialidad(),
		};
	}
}
