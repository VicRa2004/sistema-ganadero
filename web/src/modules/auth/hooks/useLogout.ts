import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useLogout() {
	const logoutStore = useAuthStore((state) => state.logout);
	const queryClient = useQueryClient();
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
			queryClient.clear();
			logoutStore();
			navigate({ to: "/login" });
		},
		onError: () => {
			queryClient.clear();
			logoutStore();
			navigate({ to: "/login" });
		},
	});
}
