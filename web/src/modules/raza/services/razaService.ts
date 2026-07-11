import { api } from "@/config/axios";
import type { RazaDto } from "../types";

export const razaService = {
	async listar(): Promise<RazaDto[]> {
		const { data } = await api.get<RazaDto[]>("/razas");
		return data;
	},
};
