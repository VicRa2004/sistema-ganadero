import type { Actor } from "@/core/shared/domain/Actor";
import type { DashboardResumenDto } from "../dtos/DashboardResumenDto";

export interface DashboardResumenQuery {
	obtenerResumen(actor: Actor): Promise<DashboardResumenDto>;
}
