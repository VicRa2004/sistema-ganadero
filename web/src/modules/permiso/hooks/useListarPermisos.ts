import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { permisoService } from "../services/permisoService";

export function useListarPermisos() {
	return useQuery({
		queryKey: queryKeys.permisos.list(),
		queryFn: () => permisoService.listar(),
	});
}
