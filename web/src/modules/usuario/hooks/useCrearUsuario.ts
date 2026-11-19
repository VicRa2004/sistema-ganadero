import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { usuarioService } from "../services/usuarioService";
import type { CrearUsuarioInput } from "../types";

export function useCrearUsuario() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Usuario creado" },
		mutationFn: (input: CrearUsuarioInput) => usuarioService.crear(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.lists() });
		},
	});
}
