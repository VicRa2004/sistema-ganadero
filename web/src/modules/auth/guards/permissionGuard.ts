import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { queryKeys } from "@/lib/queryKeys";
import type { RouterAuthContext } from "@/routes/__root";
import { fetchAndSyncUserPermissions } from "../hooks/useUserPermissions";
import { useAuthStore } from "../store/authStore";

interface GuardContext {
	queryClient: QueryClient;
	auth: RouterAuthContext;
}

/**
 * Verifica autenticación y consulta permisos efectivos en vivo vía TanStack Query.
 * Redirige a `/login` si no hay sesión, o a `/dashboard` si carece de `${resource}:${action}`.
 */
export async function requireAuthAndPermission(
	context: GuardContext,
	resource: string,
	action: string,
): Promise<void> {
	if (!context.auth.isAuthenticated) {
		throw redirect({ to: "/login" });
	}

	const user = context.auth.user ?? useAuthStore.getState().user;
	let permissions = useAuthStore.getState().permissions ?? [];

	if (user?.id) {
		try {
			permissions = await context.queryClient.ensureQueryData({
				queryKey: queryKeys.auth.permissions(user.id),
				queryFn: () => fetchAndSyncUserPermissions(user.id),
				staleTime: 1000 * 60,
			});
		} catch {
			// Si falla la consulta de red, respalda con lo último sincronizado en store
			permissions = useAuthStore.getState().permissions ?? [];
		}
	}

	if (!permissions.includes(`${resource}:${action}`)) {
		throw redirect({ to: "/dashboard" });
	}
}
