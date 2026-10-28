import { useQuery } from "@tanstack/react-query";
import { permisoService } from "../services/permisoService";

export function useListarPermisos() {
	return useQuery({
		queryKey: ["permisos"],
		queryFn: () => permisoService.listar(),
	});
}
