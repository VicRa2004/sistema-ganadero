import { api } from "@/config/axios";
import type {
	ActualizarGanadoInput,
	DarDeBajaGanadoInput,
	GanadoDetalleDto,
	GanadoDto,
	GanadoFilters,
	MotivoBajaDto,
	PaginatedResponse,
	RegistrarGanadoInput,
	RegistrarPesajeInput,
	TrasladarGanadoInput,
} from "../types";

/** Construye un FormData a partir del input de ganado (para soportar imagen) */
function buildGanadoFormData(
	input: RegistrarGanadoInput | ActualizarGanadoInput,
): FormData {
	const formData = new FormData();
	const entries = Object.entries(input) as [string, unknown][];
	for (const [key, value] of entries) {
		if (value === undefined) continue;
		if (value === null) {
			formData.append(key, "");
		} else if (value instanceof File) {
			formData.append(key, value);
		} else {
			formData.append(key, String(value));
		}
	}
	return formData;
}

export const ganadoService = {
	async listar(filters: GanadoFilters): Promise<PaginatedResponse<GanadoDto>> {
		const { data } = await api.get<PaginatedResponse<GanadoDto>>("/ganado", {
			params: {
				page: filters.page,
				limit: filters.limit,
				identificador: filters.identificador || undefined,
				razaId: filters.razaId || undefined,
				terrenoId: filters.terrenoId || undefined,
				propietarioId: filters.propietarioId || undefined,
				soloActivos: filters.soloActivos !== false ? "true" : "false",
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
		const formData = buildGanadoFormData(input);
		const { data } = await api.post<GanadoDto>("/ganado", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return data;
	},

	async actualizar(
		id: number,
		input: ActualizarGanadoInput,
	): Promise<GanadoDto> {
		const formData = buildGanadoFormData(input);
		const { data } = await api.put<GanadoDto>(`/ganado/${id}`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
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

	async darDeBaja(id: number, input: DarDeBajaGanadoInput): Promise<GanadoDto> {
		const { data } = await api.post<GanadoDto>(`/ganado/${id}/baja`, input);
		return data;
	},

	async listarMotivosBaja(): Promise<MotivoBajaDto[]> {
		const { data } = await api.get<MotivoBajaDto[]>("/ganado/motivos-baja");
		return data;
	},

	async eliminar(id: number): Promise<void> {
		await api.delete(`/ganado/${id}`);
	},
};
