import { injectable } from "tsyringe";
import type { Terreno } from "../../domain/Terreno";
import type { TerrenoOutputDto } from "../dtos/TerrenoDto";

@injectable()
export class TerrenoMapper {
	public toDto(terreno: Terreno): TerrenoOutputDto {
		return {
			id: terreno.getId(),
			nombre: terreno.getNombre(),
			ubicacion: terreno.getUbicacion(),
			extensionHectareas: terreno.getExtensionHectareas(),
			capacidadMaxima: terreno.getCapacidadMaxima(),
			imagenTerreno: terreno.getImagenTerreno(),
			usuarioId: terreno.getUsuarioId(),
		};
	}
}
