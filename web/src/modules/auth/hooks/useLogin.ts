import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useLogin() {
	const loginStore = useAuthStore((state) => state.login);
	const setPermissions = useAuthStore((state) => state.setPermissions);
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async (credentials: Record<string, string>) => {
			// 1. Iniciar sesión y obtener accessToken + user
			const response = await authService.login(credentials);

			// 2. Obtener los permisos del usuario con su ID recién recibido
			const permissionsData = await authService.getPermissions(
				response.user.id,
			);
			const formattedPermissions = permissionsData.map(
				(p) => `${p.resource}:${p.action}`,
			);

			return { response, formattedPermissions };
		},
		onSuccess: ({ response, formattedPermissions }) => {
			// 3. Guardar datos en el store de Zustand
			loginStore(response.accessToken, response.user);
			setPermissions(formattedPermissions);

			// 4. Redireccionar al Dashboard
			navigate({ to: "/dashboard" });
		},
	});
}
