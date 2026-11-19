import type { ReactNode } from "react";
import { usePermissions } from "@/modules/auth/hooks/usePermissions";

interface PermissionGuardProps {
	resource: string;
	action: string;
	fallback?: ReactNode;
	children: ReactNode;
}

/**
 * Renderiza `children` únicamente si el usuario autenticado posee `${resource}:${action}`
 * según los permisos efectivos sincronizados desde el servidor.
 */
export function PermissionGuard({
	resource,
	action,
	fallback = null,
	children,
}: PermissionGuardProps) {
	const { can } = usePermissions();
	if (!can(resource, action)) {
		return <>{fallback}</>;
	}
	return <>{children}</>;
}
