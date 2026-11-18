import { api } from "@/config/axios";
import { descargarArchivoApi } from "@/lib/descargarArchivo";
import type {
	AplicacionSanitariaDto,
	CalendarioSanitarioDto,
	CrearPlanSanitarioInput,
	HistorialSanitarioGanadoDto,
	PaginatedResponse,
	PlanSanitarioDto,
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

	async realizar(id: number): Promise<SesionSanitariaDto> {
		const { data } = await api.post<SesionSanitariaDto>(
			`/sesiones-sanitarias/${id}/realizar`,
		);
		return data;
	},

	async cancelar(id: number): Promise<SesionSanitariaDto> {
		const { data } = await api.post<SesionSanitariaDto>(
			`/sesiones-sanitarias/${id}/cancelar`,
		);
		return data;
	},

	async obtenerCalendario(params: {
		desde: string;
		hasta: string;
		terrenoId?: number;
		ganadoId?: number;
	}): Promise<CalendarioSanitarioDto> {
		const { data } = await api.get<CalendarioSanitarioDto>(
			"/sesiones-sanitarias/calendario",
			{ params },
		);
		return data;
	},

	async listarPlanes(): Promise<PlanSanitarioDto[]> {
		const { data } = await api.get<PlanSanitarioDto[]>(
			"/sesiones-sanitarias/planes",
		);
		return data;
	},

	async crearPlan(input: CrearPlanSanitarioInput): Promise<PlanSanitarioDto> {
		const { data } = await api.post<PlanSanitarioDto>(
			"/sesiones-sanitarias/planes",
			input,
		);
		return data;
	},

	async actualizarPlan(
		id: number,
		input: Partial<CrearPlanSanitarioInput>,
	): Promise<PlanSanitarioDto> {
		const { data } = await api.put<PlanSanitarioDto>(
			`/sesiones-sanitarias/planes/${id}`,
			input,
		);
		return data;
	},

	async eliminarPlan(id: number): Promise<void> {
		await api.delete(`/sesiones-sanitarias/planes/${id}`);
	},

	async generarSesionesPlanes(): Promise<{ sesionesGeneradas: number }> {
		const { data } = await api.post<{ sesionesGeneradas: number }>(
			"/sesiones-sanitarias/planes/generar",
		);
		return data;
	},

	async exportarCsv(
		filters?: Omit<SesionSanitariaFilters, "page" | "limit">,
	): Promise<void> {
		await descargarArchivoApi(
			"/sesiones-sanitarias/exportar/csv",
			"sesiones-sanitarias.csv",
			filters,
		);
	},

	async exportarPdf(
		filters?: Omit<SesionSanitariaFilters, "page" | "limit">,
	): Promise<void> {
		await descargarArchivoApi(
			"/sesiones-sanitarias/exportar/pdf",
			"sesiones-sanitarias.pdf",
			filters,
		);
	},

	async exportarHistorialGanadoPdf(ganadoId: number): Promise<void> {
		await descargarArchivoApi(
			`/sesiones-sanitarias/ganado/${ganadoId}/historial/pdf`,
			`historial-sanitario-${ganadoId}.pdf`,
		);
	},
};
