import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useRegister() {
	const loginStore = useAuthStore((state) => state.login);
	const setPermissions = useAuthStore((state) => state.setPermissions);
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async (userData: Record<string, string>) => {
			// 1. Registrar usuario y obtener accessToken + user (rol USER por defecto)
			const response = await authService.register(userData);

			// 2. Obtener los permisos del usuario
			const permissionsData = await authService.getPermissions(
				response.user.id,
			);
			const formattedPermissions = permissionsData.map(
				(p) => `${p.resource}:${p.action}`,
			);

			return { response, formattedPermissions };
		},
		onSuccess: ({ response, formattedPermissions }) => {
			// 3. Guardar en Zustand
			loginStore(response.accessToken, response.user);
			setPermissions(formattedPermissions);

			// 4. Redireccionar al Dashboard
			navigate({ to: "/dashboard" });
		},
	});
}
