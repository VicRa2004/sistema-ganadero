import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { veterinarioService } from "../services/veterinarioService";

export function useListarVeterinarios(
	page = 1,
	limit = 10,
	nombre?: string,
	especialidad?: string,
) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: queryKeys.veterinarios.list({
			page,
			limit,
			nombre,
			especialidad,
		}),
		queryFn: () => veterinarioService.listar(page, limit, nombre, especialidad),
	});
}
