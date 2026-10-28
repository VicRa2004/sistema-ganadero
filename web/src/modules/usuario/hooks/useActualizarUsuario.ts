import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usuarioService } from "../services/usuarioService";
import type { ActualizarUsuarioInput } from "../types";

export function useActualizarUsuario() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Usuario actualizado" },
		mutationFn: ({
			id,
			input,
		}: {
			id: number;
			input: ActualizarUsuarioInput;
		}) => usuarioService.actualizar(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["usuarios"] });
		},
	});
}
