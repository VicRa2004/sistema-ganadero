import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { queryKeys } from "@/lib/queryKeys";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useRegister() {
	const loginStore = useAuthStore((state) => state.login);
	const setPermissions = useAuthStore((state) => state.setPermissions);
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async (userData: Record<string, string>) => {
			// 1. Registrar usuario y obtener accessToken + user (rol USER por defecto)
			const response = await authService.register(userData);
			useAuthStore.getState().setAccessToken(response.accessToken);

			try {
				// 2. Obtener los permisos efectivos del usuario
				const permissionsData = await authService.getPermissions(
					response.user.id,
				);
				const formattedPermissions = permissionsData.map(
					(p) => `${p.resource}:${p.action}`,
				);

				return { response, formattedPermissions };
			} catch (error) {
				useAuthStore.getState().setAccessToken(null);
				throw error;
			}
		},
		onSuccess: ({ response, formattedPermissions }) => {
			// 3. Guardar en Zustand y cachear permisos en TanStack Query
			loginStore(response.accessToken, response.user);
			setPermissions(formattedPermissions);
			queryClient.setQueryData(
				queryKeys.auth.permissions(response.user.id),
				formattedPermissions,
			);

			// 4. Redireccionar al Dashboard
			navigate({ to: "/dashboard" });
		},
	});
}
