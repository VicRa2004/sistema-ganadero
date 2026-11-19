import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { razaService } from "../services/razaService";
import type { RazaInput } from "../types";

export function useActualizarRaza() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Raza actualizada" },
		mutationFn: ({ id, input }: { id: number; input: RazaInput }) =>
			razaService.actualizar(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.razas.list() });
		},
	});
}
