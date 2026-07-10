import { api } from "@/config/axios";
import type { AuthResponse, PermissionDto } from "../types";

export const authService = {
	async login(credentials: Record<string, string>): Promise<AuthResponse> {
		const { data } = await api.post<AuthResponse>("/auth/login", credentials);
		return data;
	},

	async register(userData: Record<string, string>): Promise<AuthResponse> {
		const { data } = await api.post<AuthResponse>("/auth/register", userData);
		return data;
	},

	async logout(): Promise<void> {
		await api.post("/auth/logout");
	},

	async getPermissions(userId: number): Promise<PermissionDto[]> {
		const { data } = await api.get<{ data: PermissionDto[] }>(
			`/permissions/users/${userId}`,
		);
		return data.data;
	},
};
