import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";

export function useDashboardResumen() {
	return useQuery({
		queryKey: ["dashboard", "resumen"],
		queryFn: () => dashboardService.obtenerResumen(),
		staleTime: 30_000,
	});
}
