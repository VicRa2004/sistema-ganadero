import { api } from "@/config/axios";
import type {
	ActualizarGanadoInput,
	GanadoDetalleDto,
	GanadoDto,
	GanadoFilters,
	PaginatedResponse,
	RegistrarGanadoInput,
	RegistrarPesajeInput,
	TrasladarGanadoInput,
} from "../types";

export const ganadoService = {
	async listar(filters: GanadoFilters): Promise<PaginatedResponse<GanadoDto>> {
		const { data } = await api.get<PaginatedResponse<GanadoDto>>("/ganado", {
			params: {
				page: filters.page,
				limit: filters.limit,
				identificador: filters.identificador || undefined,
				razaId: filters.razaId || undefined,
				ranchoId: filters.ranchoId || undefined,
				propietarioId: filters.propietarioId || undefined,
			},
		});
		return data;
	},

	async obtenerDetalle(
		idOrIdentificador: string | number,
	): Promise<GanadoDetalleDto> {
		const { data } = await api.get<GanadoDetalleDto>(
			`/ganado/${idOrIdentificador}`,
		);
		return data;
	},

	async registrar(input: RegistrarGanadoInput): Promise<GanadoDto> {
		const { data } = await api.post<GanadoDto>("/ganado", input);
		return data;
	},

	async actualizar(
		id: number,
		input: ActualizarGanadoInput,
	): Promise<GanadoDto> {
		const { data } = await api.put<GanadoDto>(`/ganado/${id}`, input);
		return data;
	},

	async registrarPesaje(
		id: number,
		input: RegistrarPesajeInput,
	): Promise<GanadoDto> {
		const { data } = await api.post<GanadoDto>(`/ganado/${id}/pesajes`, input);
		return data;
	},

	async trasladar(id: number, input: TrasladarGanadoInput): Promise<GanadoDto> {
		const { data } = await api.post<GanadoDto>(
			`/ganado/${id}/traslados`,
			input,
		);
		return data;
	},

	async eliminar(id: number): Promise<void> {
		await api.delete(`/ganado/${id}`);
	},
};
