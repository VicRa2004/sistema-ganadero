import { api } from "@/config/axios";
import { useAuthStore } from "../store/authStore";

/**
 * Recupera la sesión al arrancar la app. El access token no se persiste, así
 * que si hay un usuario guardado se pide uno nuevo con la cookie del refresh
 * token; si falla, se limpia la sesión local.
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
		setInitialized(true);
	} catch {
		logout();
	}
}
