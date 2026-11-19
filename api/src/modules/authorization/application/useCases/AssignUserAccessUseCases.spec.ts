import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import { Permission } from "../../domain/Permission";
import type {
	AuthorizationRepository,
	RoleSummary,
	UserAccessSummary,
} from "../../domain/repository/AuthorizationRepository";
import { AssignUserDirectPermissionsUseCase } from "./AssignUserDirectPermissionsUseCase";
import { AssignUserRolesUseCase } from "./AssignUserRolesUseCase";
import { GetAllRolesUseCase } from "./GetAllRolesUseCase";
import { GetUserAccessUseCase } from "./GetUserAccessUseCase";

describe("Casos de uso de acceso de usuarios (roles y overrides)", () => {
	let rolesCatalog: RoleSummary[];
	let userAccess: UserAccessSummary;
	let repo: AuthorizationRepository;

	beforeEach(() => {
		rolesCatalog = [
			{
				id: 1,
				name: "ADMIN",
				description: "Administrador",
				isActive: true,
				permissionIds: [1, 2],
			},
			{
				id: 2,
				name: "USER",
				description: "Usuario",
				isActive: true,
				permissionIds: [1],
			},
		];
		userAccess = {
			userId: 5,
			roles: [{ id: 1, name: "ADMIN", description: "Administrador" }],
			directPermissions: [],
			effectivePermissions: [Permission.reconstitute(1, "ganado", "read")],
		};

		repo = {
			getEffectivePermissions: mock(
				async () => userAccess.effectivePermissions,
			),
			findAllRoles: mock(async () => rolesCatalog),
			findRolesByIds: mock(async (ids: number[]) =>
				rolesCatalog.filter((r) => ids.includes(r.id)),
			),
			findPermissionsByIds: mock(async (ids: number[]) =>
				ids
					.filter((id) => [1, 2].includes(id))
					.map((id) =>
						Permission.reconstitute(id, "ganado", id === 1 ? "read" : "create"),
					),
			),
			getUserAccess: mock(async (uid: number) =>
				uid === 5 ? userAccess : null,
			),
			setUserRoles: mock(async (_uid: number, roleIds: number[]) => {
				userAccess = {
					...userAccess,
					roles: rolesCatalog
						.filter((r) => roleIds.includes(r.id))
						.map((r) => ({
							id: r.id,
							name: r.name,
							description: r.description,
						})),
				};
			}),
			setUserDirectPermissions: mock(async (_uid: number, overrides) => {
				userAccess = {
					...userAccess,
					directPermissions: overrides.map((o) => ({
						permissionId: o.permissionId,
						resource: "ganado",
						action: "create",
						granted: o.granted,
					})),
				};
			}),
			findAll: mock(async () => []),
			findById: mock(async () => null),
			create: mock(async () => Permission.reconstitute(1, "ganado", "read")),
			update: mock(async () => Permission.reconstitute(1, "ganado", "read")),
			delete: mock(async () => {}),
		};
	});

	it("lista todos los roles activos y obtiene acceso del usuario", async () => {
		const roles = await new GetAllRolesUseCase(repo).run();
		expect(roles).toHaveLength(2);

		const access = await new GetUserAccessUseCase(repo).run(5);
		expect(access.userId).toBe(5);
		expect(access.roles[0]?.name).toBe("ADMIN");
	});

	it("impide dejar sin roles o auto-removerse el rol ADMIN", async () => {
		const uc = new AssignUserRolesUseCase(repo);
		await expect(uc.run(5, [], 1)).rejects.toThrow(ValidationError);
		await expect(uc.run(5, [2], 5)).rejects.toThrow(
			"No puedes quitarte el rol ADMIN",
		);
	});

	it("permite asignar nuevo rol a otro usuario", async () => {
		const uc = new AssignUserRolesUseCase(repo);
		const res = await uc.run(5, [2], 1);
		expect(res.roles.map((r) => r.name)).toEqual(["USER"]);
	});

	it("rechaza overrides duplicados y guarda permisos directos válidos", async () => {
		const uc = new AssignUserDirectPermissionsUseCase(repo);
		await expect(
			uc.run(5, [
				{ permissionId: 2, granted: true },
				{ permissionId: 2, granted: false },
			]),
		).rejects.toThrow(ValidationError);

		const res = await uc.run(5, [{ permissionId: 2, granted: true }]);
		expect(res.directPermissions).toHaveLength(1);
		expect(res.directPermissions[0]?.granted).toBeTrue();
	});
});
