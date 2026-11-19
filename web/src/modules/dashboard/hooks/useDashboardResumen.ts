import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { dashboardService } from "../services/dashboardService";

export function useDashboardResumen() {
	return useQuery({
		queryKey: queryKeys.dashboard.resumen(),
		queryFn: () => dashboardService.obtenerResumen(),
		staleTime: 30_000,
	});
}
