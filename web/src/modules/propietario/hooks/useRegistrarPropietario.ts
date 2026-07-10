import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propietarioService } from "../services/propietarioService";
import type { RegistrarPropietarioInput } from "../types";

export function useRegistrarPropietario() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: RegistrarPropietarioInput) =>
			propietarioService.registrar(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["propietarios"] });
		},
	});
}
