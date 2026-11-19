import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { permisoService } from "../services/permisoService";

export function useListarRoles() {
	return useQuery({
		queryKey: queryKeys.permisos.roles(),
		queryFn: () => permisoService.listarRoles(),
	});
}
