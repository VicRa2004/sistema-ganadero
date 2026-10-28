import { api } from "@/config/axios";
import type { RazaDto, RazaInput } from "../types";

export const razaService = {
	async listar(): Promise<RazaDto[]> {
		const { data } = await api.get<RazaDto[]>("/razas");
		return data;
	},

	async registrar(input: RazaInput): Promise<RazaDto> {
		const { data } = await api.post<RazaDto>("/razas", input);
		return data;
	},

	async actualizar(id: number, input: RazaInput): Promise<RazaDto> {
		const { data } = await api.put<RazaDto>(`/razas/${id}`, input);
		return data;
	},

	async eliminar(id: number): Promise<void> {
		await api.delete(`/razas/${id}`);
	},
};
