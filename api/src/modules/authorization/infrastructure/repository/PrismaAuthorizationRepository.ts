import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import { PermissionAlreadyExistsError } from "../../domain/error/PermissionAlreadyExistsError";
import { PermissionNotFoundError } from "../../domain/error/PermissionNotFoundError";
import { Permission } from "../../domain/Permission";
import type {
	AuthorizationRepository,
	RoleSummary,
	UserAccessSummary,
} from "../../domain/repository/AuthorizationRepository";

@injectable()
export class PrismaAuthorizationRepository implements AuthorizationRepository {
	async getEffectivePermissions(userId: number): Promise<Permission[]> {
		const permissionSelect = {
			select: { id: true, resource: true, action: true },
		} as const;

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				isActive: true,
				roles: {
					select: {
						role: {
							select: {
								isActive: true,
								permissions: {
									select: { permission: permissionSelect },
								},
							},
						},
					},
				},
				directPermissions: {
					select: { granted: true, permission: permissionSelect },
				},
			},
		});

		if (!user || !user.isActive) {
			return [];
		}

		const permissionMap = new Map<string, Permission>();

		for (const userRole of user.roles) {
			if (!userRole.role.isActive) continue;
			for (const rolePermission of userRole.role.permissions) {
				const p = rolePermission.permission;
				permissionMap.set(
					`${p.resource}:${p.action}`,
					Permission.reconstitute(p.id, p.resource, p.action),
				);
			}
		}

		for (const userPerm of user.directPermissions) {
			const p = userPerm.permission;
			const key = `${p.resource}:${p.action}`;

			if (userPerm.granted) {
				permissionMap.set(
					key,
					Permission.reconstitute(p.id, p.resource, p.action),
				);
			} else {
				permissionMap.delete(key);
			}
		}

		return [...permissionMap.values()];
	}

	async findAllRoles(): Promise<RoleSummary[]> {
		const roles = await prisma.role.findMany({
			where: { isActive: true },
			orderBy: { id: "asc" },
			include: {
				permissions: { select: { permissionId: true } },
			},
		});

		return roles.map((r) => ({
			id: r.id,
			name: r.name,
			description: r.description,
			isActive: r.isActive,
			permissionIds: r.permissions.map((p) => p.permissionId),
		}));
	}

	async findRolesByIds(roleIds: number[]): Promise<RoleSummary[]> {
		if (roleIds.length === 0) return [];
		const roles = await prisma.role.findMany({
			where: { id: { in: roleIds }, isActive: true },
			include: { permissions: { select: { permissionId: true } } },
		});
		return roles.map((r) => ({
			id: r.id,
			name: r.name,
			description: r.description,
			isActive: r.isActive,
			permissionIds: r.permissions.map((p) => p.permissionId),
		}));
	}

	async findPermissionsByIds(permissionIds: number[]): Promise<Permission[]> {
		if (permissionIds.length === 0) return [];
		const perms = await prisma.permission.findMany({
			where: { id: { in: permissionIds } },
		});
		return perms.map((p) =>
			Permission.reconstitute(p.id, p.resource, p.action),
		);
	}

	async getUserAccess(userId: number): Promise<UserAccessSummary | null> {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				roles: {
					select: {
						role: {
							select: { id: true, name: true, description: true },
						},
					},
				},
				directPermissions: {
					select: {
						granted: true,
						permission: {
							select: { id: true, resource: true, action: true },
						},
					},
				},
			},
		});

		if (!user) return null;

		const effectivePermissions = await this.getEffectivePermissions(userId);

		return {
			userId: user.id,
			roles: user.roles.map((r) => ({
				id: r.role.id,
				name: r.role.name,
				description: r.role.description,
			})),
			directPermissions: user.directPermissions.map((dp) => ({
				permissionId: dp.permission.id,
				resource: dp.permission.resource,
				action: dp.permission.action,
				granted: dp.granted,
			})),
			effectivePermissions,
		};
	}

	async setUserRoles(userId: number, roleIds: number[]): Promise<void> {
		const uniqueIds = [...new Set(roleIds)];
		await prisma.$transaction(async (tx) => {
			await tx.userRole.deleteMany({ where: { userId } });
			if (uniqueIds.length > 0) {
				await tx.userRole.createMany({
					data: uniqueIds.map((roleId) => ({ userId, roleId })),
				});
			}
		});
	}

	async setUserDirectPermissions(
		userId: number,
		overrides: Array<{ permissionId: number; granted: boolean }>,
	): Promise<void> {
		await prisma.$transaction(async (tx) => {
			await tx.userPermission.deleteMany({ where: { userId } });
			if (overrides.length > 0) {
				await tx.userPermission.createMany({
					data: overrides.map((o) => ({
						userId,
						permissionId: o.permissionId,
						granted: o.granted,
					})),
				});
			}
		});
	}

	async findAll(): Promise<Permission[]> {
		const records = await prisma.permission.findMany({
			orderBy: [{ resource: "asc" }, { action: "asc" }],
		});

		return records.map((p) =>
			Permission.reconstitute(p.id, p.resource, p.action),
		);
	}

	async findById(id: number): Promise<Permission | null> {
		const record = await prisma.permission.findUnique({ where: { id } });
		if (!record) return null;
		return Permission.reconstitute(record.id, record.resource, record.action);
	}

	async create(resource: string, action: string): Promise<Permission> {
		const existing = await prisma.permission.findUnique({
			where: { resource_action: { resource, action } },
		});

		if (existing) {
			throw new PermissionAlreadyExistsError(resource, action);
		}

		const record = await prisma.permission.create({
			data: { resource, action },
		});

		return Permission.reconstitute(record.id, record.resource, record.action);
	}

	async update(
		id: number,
		resource: string,
		action: string,
	): Promise<Permission> {
		const existing = await prisma.permission.findUnique({ where: { id } });
		if (!existing) {
			throw new PermissionNotFoundError(id);
		}

		const conflict = await prisma.permission.findFirst({
			where: { resource, action, NOT: { id } },
		});

		if (conflict) {
			throw new PermissionAlreadyExistsError(resource, action);
		}

		const record = await prisma.permission.update({
			where: { id },
			data: { resource, action },
		});

		return Permission.reconstitute(record.id, record.resource, record.action);
	}

	async delete(id: number): Promise<void> {
		const existing = await prisma.permission.findUnique({ where: { id } });
		if (!existing) {
			throw new PermissionNotFoundError(id);
		}
		await prisma.permission.delete({ where: { id } });
	}
}
