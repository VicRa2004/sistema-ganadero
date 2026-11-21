import { api } from "@/config/axios";
import type {
	ElementoPapeleraDto,
	PaginatedResponse,
	TipoPapelera,
} from "../types";

export const papeleraService = {
	async listar(
		tipo: TipoPapelera,
		page: number,
		limit: number,
	): Promise<PaginatedResponse<ElementoPapeleraDto>> {
		const { data } = await api.get<PaginatedResponse<ElementoPapeleraDto>>(
			`/papelera/${tipo}`,
			{ params: { page, limit } },
		);
		return data;
	},

	async restaurar(tipo: TipoPapelera, id: number): Promise<void> {
		await api.post(`/papelera/${tipo}/${id}/restaurar`);
	},

	async eliminarDefinitivo(tipo: TipoPapelera, id: number): Promise<void> {
		await api.delete(`/papelera/${tipo}/${id}`);
	},
};
