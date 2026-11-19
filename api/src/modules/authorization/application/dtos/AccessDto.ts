import type { PermissionDto } from "./PermissionDto";

export interface RoleDto {
	id: number;
	name: string;
	description: string | null;
	permissionIds: number[];
}

export interface UserDirectPermissionDto {
	permissionId: number;
	resource: string;
	action: string;
	granted: boolean;
}

export interface UserAccessDto {
	userId: number;
	roles: Array<{ id: number; name: string; description: string | null }>;
	directPermissions: UserDirectPermissionDto[];
	effectivePermissions: PermissionDto[];
}
