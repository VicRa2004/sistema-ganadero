import { api } from "@/config/axios";
import type { PermissionDto } from "@/modules/auth/types";

export const permisoService = {
	async listar(): Promise<PermissionDto[]> {
		const { data } = await api.get<PermissionDto[]>("/permissions");
		return data;
	},
};
