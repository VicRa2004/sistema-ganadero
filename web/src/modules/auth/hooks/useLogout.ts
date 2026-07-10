import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useLogout() {
	const logoutStore = useAuthStore((state) => state.logout);
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async () => {
			try {
				await authService.logout();
			} catch (error) {
				console.error("Error calling logout in backend", error);
			}
		},
		onSuccess: () => {
			// Limpiar Zustand store
			logoutStore();
			// Redireccionar a login
			navigate({ to: "/login" });
		},
		onError: () => {
			// En caso de error, igualmente limpiamos el frontend por seguridad
			logoutStore();
			navigate({ to: "/login" });
		},
	});
}
