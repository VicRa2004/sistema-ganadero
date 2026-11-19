import { api } from "@/config/axios";
import type { PermissionDto } from "@/modules/auth/types";
import type { RoleDto, UserAccessDto } from "../types";

export const permisoService = {
	async listar(): Promise<PermissionDto[]> {
		const { data } = await api.get<PermissionDto[]>("/permissions");
		return data;
	},

	async listarRoles(): Promise<RoleDto[]> {
		const { data } = await api.get<RoleDto[]>("/permissions/roles");
		return data;
	},

	async obtenerAccesoUsuario(userId: number): Promise<UserAccessDto> {
		const { data } = await api.get<UserAccessDto>(
			`/permissions/users/${userId}/access`,
		);
		return data;
	},

	async asignarRolesUsuario(
		userId: number,
		roleIds: number[],
	): Promise<UserAccessDto> {
		const { data } = await api.put<UserAccessDto>(
			`/permissions/users/${userId}/roles`,
			{ roleIds },
		);
		return data;
	},

	async asignarPermisosDirectos(
		userId: number,
		overrides: Array<{ permissionId: number; granted: boolean }>,
	): Promise<UserAccessDto> {
		const { data } = await api.put<UserAccessDto>(
			`/permissions/users/${userId}/direct`,
			{ overrides },
		);
		return data;
	},
};
