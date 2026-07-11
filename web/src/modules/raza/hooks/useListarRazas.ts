import { useQuery } from "@tanstack/react-query";
import { razaService } from "../services/razaService";

export function useListarRazas() {
	return useQuery({
		queryKey: ["razas"],
		queryFn: () => razaService.listar(),
	});
}
