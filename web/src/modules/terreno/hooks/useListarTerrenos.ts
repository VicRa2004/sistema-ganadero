import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { terrenoService } from "../services/terrenoService";

export function useListarTerrenos(page = 1, limit = 10) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: ["terrenos", page, limit],
		queryFn: () => terrenoService.listar(page, limit),
	});
}
