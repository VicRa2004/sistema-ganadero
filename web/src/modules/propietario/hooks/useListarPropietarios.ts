import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { propietarioService } from "../services/propietarioService";

export function useListarPropietarios(page = 1, limit = 10) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: ["propietarios", page, limit],
		queryFn: () => propietarioService.listar(page, limit),
	});
}
