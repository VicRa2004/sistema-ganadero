import { api } from "@/config/axios";
import type {
	ActualizarTratamientoInput,
	PaginatedResponse,
	ProgramarTratamientoInput,
	RegistrarAplicacionDiariaInput,
	TratamientoMedicoDto,
	TratamientoMedicoFilters,
} from "../types";

export const tratamientoMedicoService = {
	async listar(
		filters: TratamientoMedicoFilters,
	): Promise<PaginatedResponse<TratamientoMedicoDto>> {
		const { data } = await api.get<PaginatedResponse<TratamientoMedicoDto>>(
			"/tratamientos-medicos",
			{ params: filters },
		);
		return data;
	},

	async obtenerDetalle(id: number): Promise<TratamientoMedicoDto> {
		const { data } = await api.get<TratamientoMedicoDto>(
			`/tratamientos-medicos/${id}`,
		);
		return data;
	},

	async obtenerPorGanado(ganadoId: number): Promise<TratamientoMedicoDto[]> {
		const { data } = await api.get<TratamientoMedicoDto[]>(
			`/tratamientos-medicos/ganado/${ganadoId}`,
		);
		return data;
	},

	async programar(
		input: ProgramarTratamientoInput,
	): Promise<TratamientoMedicoDto> {
		const { data } = await api.post<TratamientoMedicoDto>(
			"/tratamientos-medicos",
			input,
		);
		return data;
	},

	async registrarAplicacion(
		input: RegistrarAplicacionDiariaInput,
	): Promise<TratamientoMedicoDto> {
		const { data } = await api.post<TratamientoMedicoDto>(
			"/tratamientos-medicos/aplicacion",
			input,
		);
		return data;
	},

	async finalizar(id: number): Promise<TratamientoMedicoDto> {
		const { data } = await api.patch<TratamientoMedicoDto>(
			`/tratamientos-medicos/${id}/finalizar`,
		);
		return data;
	},

	async actualizar(
		id: number,
		input: ActualizarTratamientoInput,
	): Promise<TratamientoMedicoDto> {
		const { data } = await api.put<TratamientoMedicoDto>(
			`/tratamientos-medicos/${id}`,
			input,
		);
		return data;
	},

	async eliminar(id: number): Promise<void> {
		await api.delete(`/tratamientos-medicos/${id}`);
	},
};
