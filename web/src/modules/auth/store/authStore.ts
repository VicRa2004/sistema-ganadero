import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserDto } from "../types";

interface AuthState {
	accessToken: string | null;
	user: UserDto | null;
	permissions: string[] | null;
	isInitialized: boolean;
	login: (accessToken: string, user: UserDto) => void;
	logout: () => void;
	setAccessToken: (token: string | null) => void;
	setPermissions: (permissions: string[]) => void;
	setInitialized: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			accessToken: null,
			user: null,
			permissions: null,
			isInitialized: false,
			login: (accessToken, user) =>
				set({ accessToken, user, isInitialized: true }),
			logout: () =>
				set({
					accessToken: null,
					user: null,
					permissions: null,
					isInitialized: true,
				}),
			setAccessToken: (accessToken) => set({ accessToken }),
			setPermissions: (permissions) => set({ permissions }),
			setInitialized: (isInitialized) => set({ isInitialized }),
		}),
		{
			name: "auth-storage", // Nombre de la clave en localStorage
			// El accessToken vive solo en memoria (se recupera con /auth/refresh al
			// arrancar, ver restoreSession); en localStorage solo van datos no sensibles.
			partialize: (state) => ({
				user: state.user,
				permissions: state.permissions,
			}),
			// v0 guardaba también el accessToken: se descarta al migrar
			version: 1,
			migrate: (persisted) => {
				const { user = null, permissions = null } = (persisted ?? {}) as {
					user?: UserDto | null;
					permissions?: string[] | null;
				};
				return { user, permissions };
			},
		},
	),
);
