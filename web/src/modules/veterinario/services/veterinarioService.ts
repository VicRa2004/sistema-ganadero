import { api } from "@/config/axios";
import type {
	ActualizarVeterinarioInput,
	PaginatedResponse,
	VeterinarioDto,
	RegistrarVeterinarioInput,
} from "../types";

export const veterinarioService = {
	async listar(
		page = 1,
		limit = 10,
		nombre?: string,
		especialidad?: string,
	): Promise<PaginatedResponse<VeterinarioDto>> {
		const { data } = await api.get<PaginatedResponse<VeterinarioDto>>(
			"/veterinarios",
			{ params: { page, limit, nombre, especialidad } },
		);
		return data;
	},

	async obtenerDetalle(id: number): Promise<VeterinarioDto> {
		const { data } = await api.get<VeterinarioDto>(`/veterinarios/${id}`);
		return data;
	},

	async registrar(input: RegistrarVeterinarioInput): Promise<VeterinarioDto> {
		const { data } = await api.post<VeterinarioDto>("/veterinarios", input);
		return data;
	},

	async actualizar(
		id: number,
		input: ActualizarVeterinarioInput,
	): Promise<VeterinarioDto> {
		const { data } = await api.put<VeterinarioDto>(
			`/veterinarios/${id}`,
			input,
		);
		return data;
	},

	async eliminar(id: number): Promise<void> {
		await api.delete(`/veterinarios/${id}`);
	},
};
