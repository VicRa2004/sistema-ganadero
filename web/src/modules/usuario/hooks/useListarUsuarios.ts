import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usuarioService } from "../services/usuarioService";

export function useListarUsuarios(page = 1, limit = 10, email = "") {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: ["usuarios", page, limit, email],
		queryFn: () => usuarioService.listar(page, limit, email),
	});
}
