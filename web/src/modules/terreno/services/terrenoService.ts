import { api } from "@/config/axios";
import type {
	ActualizarTerrenoInput,
	PaginatedResponse,
	TerrenoCapacidadDto,
	TerrenoDto,
	RegistrarTerrenoInput,
} from "../types";

export const terrenoService = {
	async listar(page = 1, limit = 10): Promise<PaginatedResponse<TerrenoDto>> {
		const { data } = await api.get<PaginatedResponse<TerrenoDto>>("/terrenos", {
			params: { page, limit },
		});
		return data;
	},

	async obtenerDetalle(id: number): Promise<TerrenoDto> {
		const { data } = await api.get<TerrenoDto>(`/terrenos/${id}`);
		return data;
	},

	async obtenerCapacidad(id: number): Promise<TerrenoCapacidadDto> {
		const { data } = await api.get<TerrenoCapacidadDto>(
			`/terrenos/${id}/capacidad`,
		);
		return data;
	},

	async registrar(input: RegistrarTerrenoInput): Promise<TerrenoDto> {
		const formData = new FormData();
		formData.append("nombre", input.nombre);
		formData.append("ubicacion", input.ubicacion);
		formData.append("extensionHectareas", input.extensionHectareas.toString());
		formData.append("capacidadMaxima", input.capacidadMaxima.toString());
		if (input.imagenTerreno) {
			formData.append("imagenTerreno", input.imagenTerreno);
		}

		const { data } = await api.post<TerrenoDto>("/terrenos", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return data;
	},

	async actualizar(
		id: number,
		input: ActualizarTerrenoInput,
	): Promise<TerrenoDto> {
		const formData = new FormData();
		if (input.nombre !== undefined) formData.append("nombre", input.nombre);
		if (input.ubicacion !== undefined)
			formData.append("ubicacion", input.ubicacion);
		if (input.extensionHectareas !== undefined) {
			formData.append(
				"extensionHectareas",
				input.extensionHectareas.toString(),
			);
		}
		if (input.capacidadMaxima !== undefined) {
			formData.append("capacidadMaxima", input.capacidadMaxima.toString());
		}
		if (input.imagenTerreno !== undefined) {
			if (input.imagenTerreno instanceof File) {
				formData.append("imagenTerreno", input.imagenTerreno);
			} else if (input.imagenTerreno === null) {
				formData.append("imagenTerreno", "null");
			}
		}

		const { data } = await api.put<TerrenoDto>(`/terrenos/${id}`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return data;
	},

	async eliminar(id: number): Promise<void> {
		await api.delete(`/terrenos/${id}`);
	},
};
