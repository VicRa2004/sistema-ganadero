import { useQuery } from "@tanstack/react-query";
import { insumoService } from "../services/insumoService";

export function useListarInsumos(
	page = 1,
	limit = 10,
	nombre?: string,
	tipo?: string,
) {
	return useQuery({
		queryKey: ["insumos", page, limit, nombre, tipo],
		queryFn: () => insumoService.listar(page, limit, nombre, tipo),
	});
}
