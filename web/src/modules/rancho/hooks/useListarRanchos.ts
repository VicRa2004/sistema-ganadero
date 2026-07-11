import { useQuery } from "@tanstack/react-query";
import { ranchoService } from "../services/ranchoService";

export function useListarRanchos(page = 1, limit = 10) {
	return useQuery({
		queryKey: ["ranchos", page, limit],
		queryFn: () => ranchoService.listar(page, limit),
	});
}
