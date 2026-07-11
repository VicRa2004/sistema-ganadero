import { injectable } from "tsyringe";
import type { Rancho } from "../../domain/Rancho";
import type { RanchoOutputDto } from "../dtos/RanchoDto";

@injectable()
export class RanchoMapper {
	public toDto(rancho: Rancho): RanchoOutputDto {
		return {
			id: rancho.getId(),
			nombre: rancho.getNombre(),
			ubicacion: rancho.getUbicacion(),
			extensionHectareas: rancho.getExtensionHectareas(),
			capacidadMaxima: rancho.getCapacidadMaxima(),
			usuarioId: rancho.getUsuarioId(),
		};
	}
}
