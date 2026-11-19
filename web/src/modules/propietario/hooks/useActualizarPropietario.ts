import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { propietarioService } from "../services/propietarioService";
import type { ActualizarPropietarioInput } from "../types";

export function useActualizarPropietario(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Propietario actualizado" },
		mutationFn: (input: ActualizarPropietarioInput) =>
			propietarioService.actualizar(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.propietarios.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.propietarios.detail(id),
			});
		},
	});
}
