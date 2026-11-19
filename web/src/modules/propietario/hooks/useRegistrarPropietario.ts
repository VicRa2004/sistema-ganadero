import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { propietarioService } from "../services/propietarioService";
import type { RegistrarPropietarioInput } from "../types";

export function useRegistrarPropietario() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Propietario registrado" },
		mutationFn: (input: RegistrarPropietarioInput) =>
			propietarioService.registrar(input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.propietarios.lists(),
			});
		},
	});
}
