import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { razaService } from "../services/razaService";
import type { RazaInput } from "../types";

export function useRegistrarRaza() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Raza registrada" },
		mutationFn: (input: RazaInput) => razaService.registrar(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.razas.list() });
		},
	});
}
