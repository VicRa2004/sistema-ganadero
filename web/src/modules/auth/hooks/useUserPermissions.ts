import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export async function fetchAndSyncUserPermissions(
	userId: number,
): Promise<string[]> {
	const data = await authService.getPermissions(userId);
	const formatted = data.map((p) => `${p.resource}:${p.action}`);
	useAuthStore.getState().setPermissions(formatted);
	return formatted;
}

export function useUserPermissions() {
	const userId = useAuthStore((s) => s.user?.id);
	const isAuthenticated = useAuthStore((s) => !!s.accessToken);

	return useQuery({
		queryKey: queryKeys.auth.permissions(userId ?? 0),
		queryFn: () => fetchAndSyncUserPermissions(userId as number),
		enabled: isAuthenticated && typeof userId === "number" && userId > 0,
		staleTime: 1000 * 60, // Refresco vivo máximo cada 60s
	});
}
