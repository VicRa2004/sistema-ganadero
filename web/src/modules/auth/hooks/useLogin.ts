import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { queryKeys } from "@/lib/queryKeys";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useLogin() {
	const loginStore = useAuthStore((state) => state.login);
	const setPermissions = useAuthStore((state) => state.setPermissions);
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async (credentials: Record<string, string>) => {
			// 1. Iniciar sesión y obtener accessToken + user
			const response = await authService.login(credentials);
			// Guardar temporalmente el token para que el interceptor lo adjunte en /permissions
			useAuthStore.getState().setAccessToken(response.accessToken);

			try {
				// 2. Obtener los permisos efectivos del usuario con su ID recién recibido
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
			// 3. Guardar datos en Zustand y cachear permisos en TanStack Query
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
