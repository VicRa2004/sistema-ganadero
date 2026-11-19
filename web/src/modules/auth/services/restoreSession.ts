import { api } from "@/config/axios";
import { queryClient } from "@/config/query";
import { queryKeys } from "@/lib/queryKeys";
import { fetchAndSyncUserPermissions } from "../hooks/useUserPermissions";
import { useAuthStore } from "../store/authStore";

/**
 * Recupera la sesión al arrancar la app. El access token no se persiste, así
 * que si hay un usuario guardado se pide uno nuevo con la cookie del refresh
 * token y se sincronizan los permisos efectivos en vivo; si falla, se limpia la sesión.
 */
export async function restoreSession(): Promise<void> {
	const { user, accessToken, setAccessToken, logout, setInitialized } =
		useAuthStore.getState();

	if (accessToken || !user) {
		setInitialized(true);
		return;
	}

	try {
		const { data } = await api.post<{ accessToken: string }>("/auth/refresh");
		setAccessToken(data.accessToken);
		try {
			await queryClient.fetchQuery({
				queryKey: queryKeys.auth.permissions(user.id),
				queryFn: () => fetchAndSyncUserPermissions(user.id),
			});
		} catch {
			// Si /permissions falla temporalmente, no tumbamos una sesión válida
		}
		setInitialized(true);
	} catch {
		logout();
	}
}
