import { injectable } from "tsyringe";
import type { Raza } from "../../domain/Raza";
import type { RazaOutputDto } from "../dtos/RazaDto";

@injectable()
export class RazaMapper {
	public toDto(raza: Raza): RazaOutputDto {
		return {
			id: raza.getId(),
			nombre: raza.getNombre(),
			descripcion: raza.getDescripcion(),
		};
	}
}
