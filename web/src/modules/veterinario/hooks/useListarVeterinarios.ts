import { useQuery } from "@tanstack/react-query";
import { veterinarioService } from "../services/veterinarioService";

export function useListarVeterinarios(
	page = 1,
	limit = 10,
	nombre?: string,
	especialidad?: string,
) {
	return useQuery({
		queryKey: ["veterinarios", page, limit, nombre, especialidad],
		queryFn: () => veterinarioService.listar(page, limit, nombre, especialidad),
	});
}
