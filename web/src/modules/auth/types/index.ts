export interface UserDto {
	id: number;
	name: string;
	email: string;
	role: string;
	isActive: boolean;
}

export interface AuthResponse {
	accessToken: string;
	user: UserDto;
}

export interface PermissionDto {
	id: number;
	resource: string;
	action: string;
}
