import { api } from "@/config/axios";
import type {
	ActualizarRacionInputDto,
	AutonomiaAlimentoDto,
	CrearRacionInputDto,
	RacionFilters,
	RacionOutputDto,
	RacionesPaginated,
	RegistrarSuministroInputDto,
	SuministroFilters,
	SuministroOutputDto,
	SuministrosPaginated,
} from "../types";

export const alimentacionService = {
	async obtenerAutonomia(): Promise<AutonomiaAlimentoDto[]> {
		const { data } = await api.get<AutonomiaAlimentoDto[]>(
			"/alimentacion/autonomia",
		);
		return data;
	},

	async listarRaciones(
		filters: RacionFilters = {},
	): Promise<RacionesPaginated> {
		const { data } = await api.get<RacionesPaginated>(
			"/alimentacion/raciones",
			{
				params: {
					page: filters.page ?? 1,
					limit: filters.limit ?? 10,
					activo:
						filters.activo === undefined ? undefined : String(filters.activo),
					terrenoId: filters.terrenoId || undefined,
					loteId: filters.loteId || undefined,
				},
			},
		);
		return data;
	},

	async crearRacion(input: CrearRacionInputDto): Promise<RacionOutputDto> {
		const { data } = await api.post<RacionOutputDto>(
			"/alimentacion/raciones",
			input,
		);
		return data;
	},

	async actualizarRacion(
		id: number,
		input: ActualizarRacionInputDto,
	): Promise<RacionOutputDto> {
		const { data } = await api.put<RacionOutputDto>(
			`/alimentacion/raciones/${id}`,
			input,
		);
		return data;
	},

	async eliminarRacion(id: number): Promise<void> {
		await api.delete(`/alimentacion/raciones/${id}`);
	},

	async registrarSuministro(
		racionId: number,
		input: RegistrarSuministroInputDto,
	): Promise<SuministroOutputDto> {
		const { data } = await api.post<SuministroOutputDto>(
			`/alimentacion/raciones/${racionId}/suministrar`,
			input,
		);
		return data;
	},

	async listarSuministros(
		filters: SuministroFilters = {},
	): Promise<SuministrosPaginated> {
		const { data } = await api.get<SuministrosPaginated>(
			"/alimentacion/suministros",
			{
				params: {
					page: filters.page ?? 1,
					limit: filters.limit ?? 10,
					racionId: filters.racionId || undefined,
					desde: filters.desde || undefined,
					hasta: filters.hasta || undefined,
				},
			},
		);
		return data;
	},
};
