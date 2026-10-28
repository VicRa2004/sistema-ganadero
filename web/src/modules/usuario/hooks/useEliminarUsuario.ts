import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usuarioService } from "../services/usuarioService";

export function useEliminarUsuario() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Usuario eliminado" },
		mutationFn: (id: number) => usuarioService.eliminar(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["usuarios"] });
		},
	});
}
