import { api } from "@/config/axios";
import type {
	ActualizarPropietarioInput,
	PaginatedResponse,
	PropietarioDetalleDto,
	PropietarioDto,
	RegistrarPropietarioInput,
} from "../types";

export const propietarioService = {
	async listar(
		page = 1,
		limit = 10,
	): Promise<PaginatedResponse<PropietarioDto>> {
		const { data } = await api.get<PaginatedResponse<PropietarioDto>>(
			"/propietarios",
			{ params: { page, limit } },
		);
		return data;
	},

	async obtenerDetalle(id: number): Promise<PropietarioDetalleDto> {
		const { data } = await api.get<PropietarioDetalleDto>(
			`/propietarios/${id}`,
		);
		return data;
	},

	async registrar(input: RegistrarPropietarioInput): Promise<PropietarioDto> {
		const { data } = await api.post<PropietarioDto>("/propietarios", input);
		return data;
	},

	async actualizar(
		id: number,
		input: ActualizarPropietarioInput,
	): Promise<PropietarioDto> {
		const { data } = await api.put<PropietarioDto>(
			`/propietarios/${id}`,
			input,
		);
		return data;
	},

	async eliminar(id: number): Promise<void> {
		await api.delete(`/propietarios/${id}`);
	},
};
