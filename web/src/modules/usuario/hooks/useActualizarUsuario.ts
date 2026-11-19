import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
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
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.lists() });
			queryClient.invalidateQueries({
				queryKey: queryKeys.auth.permissions(variables.id),
			});
		},
	});
}
