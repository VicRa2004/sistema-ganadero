import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useCambiarPassword() {
	const logout = useAuthStore((state) => state.logout);

	return useMutation({
		meta: { successMessage: "Contraseña actualizada, inicia sesión de nuevo" },
		mutationFn: authService.changePassword,
		// La API revoca todas las sesiones; main.tsx redirige a /login al limpiar el token
		onSuccess: () => logout(),
	});
}
