import type { Actor } from "@/core/shared/domain/Actor";
import type { AutonomiaAlimentoDto } from "../dtos/AlimentacionDto";

export interface AutonomiaAlimentoQuery {
	obtenerAutonomia(actor?: Actor): Promise<AutonomiaAlimentoDto[]>;
}
