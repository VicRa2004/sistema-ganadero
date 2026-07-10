import { useQuery } from "@tanstack/react-query";
import { propietarioService } from "../services/propietarioService";

export function useListarPropietarios(page = 1, limit = 10) {
	return useQuery({
		queryKey: ["propietarios", page, limit],
		queryFn: () => propietarioService.listar(page, limit),
	});
}
