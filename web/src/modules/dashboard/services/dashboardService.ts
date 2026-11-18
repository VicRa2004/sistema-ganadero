import { api } from "@/config/axios";
import type { DashboardResumenDto } from "../types";

export const dashboardService = {
	async obtenerResumen(): Promise<DashboardResumenDto> {
		const { data } = await api.get<DashboardResumenDto>("/dashboard/resumen");
		return data;
	},
};
