import { api } from "@/config/axios";
import type {
	AplicacionSanitariaDto,
	HistorialSanitarioGanadoDto,
	PaginatedResponse,
	RegistrarResultadoAnimalInput,
	RegistrarSesionSanitariaInput,
	SesionSanitariaDto,
	SesionSanitariaFilters,
} from "../types";

export const sesionSanitariaService = {
	async listar(
		filters: SesionSanitariaFilters,
	): Promise<PaginatedResponse<SesionSanitariaDto>> {
		const { data } = await api.get<PaginatedResponse<SesionSanitariaDto>>(
			"/sesiones-sanitarias",
			{ params: filters },
		);
		return data;
	},

	async obtenerDetalle(id: number): Promise<SesionSanitariaDto> {
		const { data } = await api.get<SesionSanitariaDto>(
			`/sesiones-sanitarias/${id}`,
		);
		return data;
	},

	async registrar(
		input: RegistrarSesionSanitariaInput,
	): Promise<SesionSanitariaDto> {
		const { data } = await api.post<SesionSanitariaDto>(
			"/sesiones-sanitarias",
			input,
		);
		return data;
	},

	async registrarResultadoAnimal(
		input: RegistrarResultadoAnimalInput,
	): Promise<AplicacionSanitariaDto> {
		const { data } = await api.post<AplicacionSanitariaDto>(
			"/sesiones-sanitarias/aplicacion",
			input,
		);
		return data;
	},

	async obtenerHistorialGanado(
		ganadoId: number,
	): Promise<HistorialSanitarioGanadoDto[]> {
		const { data } = await api.get<HistorialSanitarioGanadoDto[]>(
			`/sesiones-sanitarias/ganado/${ganadoId}/historial`,
		);
		return data;
	},

	async eliminar(id: number): Promise<void> {
		await api.delete(`/sesiones-sanitarias/${id}`);
	},
};
