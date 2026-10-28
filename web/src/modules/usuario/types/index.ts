import type { UserDto } from "@/modules/auth/types";

export type { UserDto };

export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	totalItems: number;
	totalPages: number;
}

export interface CrearUsuarioInput {
	name: string;
	email: string;
	password: string;
}

export interface ActualizarUsuarioInput {
	name?: string;
	email?: string;
	isActive?: boolean;
}
