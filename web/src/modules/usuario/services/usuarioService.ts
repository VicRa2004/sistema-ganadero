import { api } from "@/config/axios";
import type {
	ActualizarUsuarioInput,
	CrearUsuarioInput,
	PaginatedResponse,
	UserDto,
} from "../types";

export const usuarioService = {
	async listar(
		page = 1,
		limit = 10,
		email?: string,
	): Promise<PaginatedResponse<UserDto>> {
		const { data } = await api.get<PaginatedResponse<UserDto>>("/users", {
			params: { page, limit, email: email || undefined },
		});
		return data;
	},

	async crear(input: CrearUsuarioInput): Promise<UserDto> {
		const { data } = await api.post<UserDto>("/users", input);
		return data;
	},

	async actualizar(
		id: number,
		input: ActualizarUsuarioInput,
	): Promise<UserDto> {
		const { data } = await api.put<UserDto>(`/users/${id}`, input);
		return data;
	},

	async eliminar(id: number): Promise<void> {
		await api.delete(`/users/${id}`);
	},
};
