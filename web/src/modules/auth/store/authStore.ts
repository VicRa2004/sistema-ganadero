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
			// Solo persistimos el token, el usuario y los permisos (excluimos isInitialized del storage)
			partialize: (state) => ({
				accessToken: state.accessToken,
				user: state.user,
				permissions: state.permissions,
			}),
		},
	),
);
