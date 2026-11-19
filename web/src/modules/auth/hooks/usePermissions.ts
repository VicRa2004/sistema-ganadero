import { useAuthStore } from "../store/authStore";
import { useUserPermissions } from "./useUserPermissions";

export function usePermissions() {
	const user = useAuthStore((s) => s.user);
	const storePermissions = useAuthStore((s) => s.permissions);
	const { data: livePermissions, isLoading } = useUserPermissions();

	const permissions = livePermissions ?? storePermissions ?? [];

	const can = (resource: string, action: string): boolean => {
		return permissions.includes(`${resource}:${action}`);
	};

	const canAny = (checks: Array<readonly [string, string]>): boolean => {
		return checks.some(([resource, action]) => can(resource, action));
	};

	return {
		permissions,
		isAdmin: user?.role === "ADMIN",
		isLoading,
		can,
		canAny,
	};
}
