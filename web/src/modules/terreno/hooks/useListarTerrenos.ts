import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { terrenoService } from "../services/terrenoService";

export function useListarTerrenos(page = 1, limit = 10) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: queryKeys.terrenos.list(page, limit),
		queryFn: () => terrenoService.listar(page, limit),
	});
}
