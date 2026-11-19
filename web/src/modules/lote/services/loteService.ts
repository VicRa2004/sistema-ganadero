import { api } from "@/config/axios";
import type {
	ActualizarLoteInputDto,
	CrearLoteInputDto,
	LoteDetalleOutputDto,
	LoteFilters,
	LoteOutputDto,
	LotesPaginated,
	PesajeMasivoLoteInputDto,
	TrasladoMasivoLoteInputDto,
	VacunacionMasivaLoteInputDto,
} from "../types";

export const loteService = {
	async listar(filters: LoteFilters = {}): Promise<LotesPaginated> {
		const { data } = await api.get<LotesPaginated>("/lotes", {
			params: {
				page: filters.page ?? 1,
				limit: filters.limit ?? 10,
				nombre: filters.nombre || undefined,
				proposito: filters.proposito || undefined,
				activo:
					filters.activo === undefined ? undefined : String(filters.activo),
			},
		});
		return data;
	},

	async obtenerDetalle(id: number): Promise<LoteDetalleOutputDto> {
		const { data } = await api.get<LoteDetalleOutputDto>(`/lotes/${id}`);
		return data;
	},

	async crear(input: CrearLoteInputDto): Promise<LoteOutputDto> {
		const { data } = await api.post<LoteOutputDto>("/lotes", input);
		return data;
	},

	async actualizar(
		id: number,
		input: ActualizarLoteInputDto,
	): Promise<LoteOutputDto> {
		const { data } = await api.put<LoteOutputDto>(`/lotes/${id}`, input);
		return data;
	},

	async eliminar(id: number): Promise<void> {
		await api.delete(`/lotes/${id}`);
	},

	async agregarMiembros(id: number, ganadoIds: number[]): Promise<void> {
		await api.post(`/lotes/${id}/miembros`, { ganadoIds });
	},

	async quitarMiembro(id: number, ganadoId: number): Promise<void> {
		await api.delete(`/lotes/${id}/miembros/${ganadoId}`);
	},

	async pesajeMasivo(
		id: number,
		input: PesajeMasivoLoteInputDto,
	): Promise<void> {
		await api.post(`/lotes/${id}/pesaje-masivo`, input);
	},

	async trasladoMasivo(
		id: number,
		input: TrasladoMasivoLoteInputDto,
	): Promise<void> {
		await api.post(`/lotes/${id}/traslado-masivo`, input);
	},

	async vacunacionMasiva(
		id: number,
		input: VacunacionMasivaLoteInputDto,
	): Promise<void> {
		await api.post(`/lotes/${id}/vacunacion`, input);
	},
};
