import { api } from "@/config/axios";
import type {
	ActualizarRanchoInput,
	PaginatedResponse,
	RanchoCapacidadDto,
	RanchoDto,
	RegistrarRanchoInput,
} from "../types";

export const ranchoService = {
	async listar(page = 1, limit = 10): Promise<PaginatedResponse<RanchoDto>> {
		const { data } = await api.get<PaginatedResponse<RanchoDto>>("/ranchos", {
			params: { page, limit },
		});
		return data;
	},

	async obtenerDetalle(id: number): Promise<RanchoDto> {
		const { data } = await api.get<RanchoDto>(`/ranchos/${id}`);
		return data;
	},

	async obtenerCapacidad(id: number): Promise<RanchoCapacidadDto> {
		const { data } = await api.get<RanchoCapacidadDto>(
			`/ranchos/${id}/capacidad`,
		);
		return data;
	},

	async registrar(input: RegistrarRanchoInput): Promise<RanchoDto> {
		const { data } = await api.post<RanchoDto>("/ranchos", input);
		return data;
	},

	async actualizar(
		id: number,
		input: ActualizarRanchoInput,
	): Promise<RanchoDto> {
		const { data } = await api.put<RanchoDto>(`/ranchos/${id}`, input);
		return data;
	},

	async eliminar(id: number): Promise<void> {
		await api.delete(`/ranchos/${id}`);
	},
};
