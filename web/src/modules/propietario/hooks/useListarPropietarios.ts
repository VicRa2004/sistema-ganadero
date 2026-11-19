import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { propietarioService } from "../services/propietarioService";

export function useListarPropietarios(page = 1, limit = 10) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: queryKeys.propietarios.list(page, limit),
		queryFn: () => propietarioService.listar(page, limit),
	});
}
