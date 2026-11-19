import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { razaService } from "../services/razaService";

export function useListarRazas() {
	return useQuery({
		queryKey: queryKeys.razas.list(),
		queryFn: () => razaService.listar(),
	});
}
