import { api } from "@/config/axios";
import type {
	EventoReproductivoDto,
	EventoReproductivoFilters,
	EventosReproductivosPaginated,
	IndicadoresReproductivosDto,
	RegistrarEventoReproductivoInput,
} from "../types";

export const reproduccionService = {
	async listar(
		filters: EventoReproductivoFilters,
	): Promise<EventosReproductivosPaginated> {
		const { data } = await api.get<EventosReproductivosPaginated>(
			"/reproduccion",
			{
				params: {
					page: filters.page,
					limit: filters.limit,
					hembraId: filters.hembraId || undefined,
					ganadoId: filters.ganadoId || undefined,
					tipo: filters.tipo || undefined,
					desde: filters.desde || undefined,
					hasta: filters.hasta || undefined,
				},
			},
		);
		return data;
	},

	async obtenerIndicadores(params?: {
		desde?: string;
		hasta?: string;
	}): Promise<IndicadoresReproductivosDto> {
		const { data } = await api.get<IndicadoresReproductivosDto>(
			"/reproduccion/indicadores",
			{ params },
		);
		return data;
	},

	async registrar(
		input: RegistrarEventoReproductivoInput,
	): Promise<EventoReproductivoDto> {
		const { data } = await api.post<EventoReproductivoDto>(
			"/reproduccion",
			input,
		);
		return data;
	},

	async eliminar(id: number): Promise<void> {
		await api.delete(`/reproduccion/${id}`);
	},
};
