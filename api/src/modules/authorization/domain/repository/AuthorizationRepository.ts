import type { Permission } from "../Permission";

export interface RoleSummary {
	id: number;
	name: string;
	description: string | null;
	isActive: boolean;
	permissionIds: number[];
}

export interface UserDirectPermissionOverride {
	permissionId: number;
	resource: string;
	action: string;
	granted: boolean;
}

export interface UserAccessSummary {
	userId: number;
	roles: Array<{ id: number; name: string; description: string | null }>;
	directPermissions: UserDirectPermissionOverride[];
	effectivePermissions: Permission[];
}

export interface AuthorizationRepository {
	getEffectivePermissions(userId: number): Promise<Permission[]>;

	findAllRoles(): Promise<RoleSummary[]>;
	findRolesByIds(roleIds: number[]): Promise<RoleSummary[]>;
	findPermissionsByIds(permissionIds: number[]): Promise<Permission[]>;
	getUserAccess(userId: number): Promise<UserAccessSummary | null>;
	setUserRoles(userId: number, roleIds: number[]): Promise<void>;
	setUserDirectPermissions(
		userId: number,
		overrides: Array<{ permissionId: number; granted: boolean }>,
	): Promise<void>;

	findAll(): Promise<Permission[]>;
	findById(id: number): Promise<Permission | null>;
	create(resource: string, action: string): Promise<Permission>;
	update(id: number, resource: string, action: string): Promise<Permission>;
	delete(id: number): Promise<void>;
}
