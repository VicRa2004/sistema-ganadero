import { injectable } from "tsyringe";
import type { PlanSanitario } from "../../domain/PlanSanitario";
import type { PlanSanitarioOutputDto } from "../dtos/PlanSanitarioDto";

@injectable()
export class PlanSanitarioMapper {
	public toDto(plan: PlanSanitario): PlanSanitarioOutputDto {
		const rel = plan.getRelaciones();
		return {
			id: plan.getId(),
			nombre: plan.getNombre(),
			descripcion: plan.getDescripcion(),
			frecuenciaDias: plan.getFrecuenciaDias(),
			dosisPorAnimal: plan.getDosisPorAnimal(),
			veterinarioId: plan.getVeterinarioId(),
			nombreVeterinario: rel?.nombreVeterinario,
			insumoId: plan.getInsumoId(),
			nombreInsumo: rel?.nombreInsumo,
			unidadMedidaInsumo: rel?.unidadMedidaInsumo,
			terrenoId: plan.getTerrenoId(),
			nombreTerreno: rel?.nombreTerreno,
			razaId: plan.getRazaId(),
			nombreRaza: rel?.nombreRaza,
			edadMinimaMeses: plan.getEdadMinimaMeses(),
			proximaEjecucion: plan.getProximaEjecucion().toISOString(),
			activo: plan.estaActivo(),
			usuarioId: plan.getUsuarioId(),
		};
	}
}
