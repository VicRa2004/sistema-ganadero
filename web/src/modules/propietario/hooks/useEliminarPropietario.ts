import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propietarioService } from "../services/propietarioService";

export function useEliminarPropietario() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => propietarioService.eliminar(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["propietarios"] });
		},
	});
}
