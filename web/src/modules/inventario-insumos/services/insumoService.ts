import { api } from "@/config/axios";
import type {
	AbastecerInsumoInput,
	ActualizarInsumoInput,
	ConsumirInsumoInput,
	InsumoDto,
	PaginatedResponse,
	RegistrarInsumoInput,
} from "../types";

export const insumoService = {
	async listar(
		page = 1,
		limit = 10,
		nombre?: string,
		tipo?: string,
	): Promise<PaginatedResponse<InsumoDto>> {
		const { data } = await api.get<PaginatedResponse<InsumoDto>>("/insumos", {
			params: { page, limit, nombre, tipo },
		});
		return data;
	},

	async obtenerCriticos(): Promise<InsumoDto[]> {
		const { data } = await api.get<InsumoDto[]>("/insumos/criticos");
		return data;
	},

	async obtenerDetalle(id: number): Promise<InsumoDto> {
		const { data } = await api.get<InsumoDto>(`/insumos/${id}`);
		return data;
	},

	async registrar(input: RegistrarInsumoInput): Promise<InsumoDto> {
		const { data } = await api.post<InsumoDto>("/insumos", input);
		return data;
	},

	async actualizar(
		id: number,
		input: ActualizarInsumoInput,
	): Promise<InsumoDto> {
		const { data } = await api.put<InsumoDto>(`/insumos/${id}`, input);
		return data;
	},

	async abastecer(id: number, input: AbastecerInsumoInput): Promise<InsumoDto> {
		const { data } = await api.post<InsumoDto>(
			`/insumos/${id}/abastecer`,
			input,
		);
		return data;
	},

	async consumir(id: number, input: ConsumirInsumoInput): Promise<InsumoDto> {
		const { data } = await api.post<InsumoDto>(
			`/insumos/${id}/consumir`,
			input,
		);
		return data;
	},

	async eliminar(id: number): Promise<void> {
		await api.delete(`/insumos/${id}`);
	},
};
