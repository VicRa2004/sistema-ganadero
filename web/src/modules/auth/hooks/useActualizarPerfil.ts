import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useActualizarPerfil() {
	return useMutation({
		meta: { successMessage: "Perfil actualizado" },
		mutationFn: authService.updateProfile,
		onSuccess: (user) => useAuthStore.setState({ user }),
	});
}
