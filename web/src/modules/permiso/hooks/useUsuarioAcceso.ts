import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { fetchAndSyncUserPermissions } from "@/modules/auth/hooks/useUserPermissions";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { permisoService } from "../services/permisoService";

export function useObtenerAccesoUsuario(userId: number, enabled = true) {
	return useQuery({
		queryKey: queryKeys.permisos.userAccess(userId),
		queryFn: () => permisoService.obtenerAccesoUsuario(userId),
		enabled: enabled && userId > 0,
	});
}

export function useAsignarRolesUsuario(userId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Roles actualizados" },
		mutationFn: (roleIds: number[]) =>
			permisoService.asignarRolesUsuario(userId, roleIds),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: queryKeys.permisos.userAccess(userId),
				}),
				queryClient.invalidateQueries({
					queryKey: queryKeys.auth.permissions(userId),
				}),
				queryClient.invalidateQueries({
					queryKey: queryKeys.usuarios.lists(),
				}),
			]);
			if (useAuthStore.getState().user?.id === userId) {
				await fetchAndSyncUserPermissions(userId);
			}
		},
	});
}

export function useAsignarPermisosDirectosUsuario(userId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { successMessage: "Permisos directos actualizados" },
		mutationFn: (
			overrides: Array<{ permissionId: number; granted: boolean }>,
		) => permisoService.asignarPermisosDirectos(userId, overrides),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: queryKeys.permisos.userAccess(userId),
				}),
				queryClient.invalidateQueries({
					queryKey: queryKeys.auth.permissions(userId),
				}),
				queryClient.invalidateQueries({
					queryKey: queryKeys.usuarios.lists(),
				}),
			]);
			if (useAuthStore.getState().user?.id === userId) {
				await fetchAndSyncUserPermissions(userId);
			}
		},
	});
}
