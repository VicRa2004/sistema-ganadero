import { useMutation, useQueryClient } from "@tanstack/react-query";
import { razaService } from "../services/razaService";

export function useEliminarRaza() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Raza eliminada" },
		mutationFn: (id: number) => razaService.eliminar(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["razas"] });
		},
	});
}
