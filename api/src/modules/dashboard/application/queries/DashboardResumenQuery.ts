import type { DashboardResumenDto } from "../dtos/DashboardResumenDto";

export interface DashboardResumenQuery {
	obtenerResumen(usuarioId?: number): Promise<DashboardResumenDto>;
}
