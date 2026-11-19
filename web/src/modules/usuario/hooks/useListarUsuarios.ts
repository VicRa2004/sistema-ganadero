import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { usuarioService } from "../services/usuarioService";

export function useListarUsuarios(page = 1, limit = 10, email = "") {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: queryKeys.usuarios.list({ page, limit, email }),
		queryFn: () => usuarioService.listar(page, limit, email),
	});
}
