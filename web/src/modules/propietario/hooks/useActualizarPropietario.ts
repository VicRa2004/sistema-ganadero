import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propietarioService } from "../services/propietarioService";
import type { ActualizarPropietarioInput } from "../types";

export function useActualizarPropietario(id: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: ActualizarPropietarioInput) =>
			propietarioService.actualizar(id, input),
		onSuccess: () => {
			// Invalida tanto el listado como el detalle específico
			queryClient.invalidateQueries({ queryKey: ["propietarios"] });
			queryClient.invalidateQueries({ queryKey: ["propietarios", id] });
		},
	});
}
