import { api } from "@/config/axios";
import type {
	ActualizarPropietarioInput,
	PaginatedResponse,
	PropietarioDetalleDto,
	PropietarioDto,
	RegistrarPropietarioInput,
} from "../types";

export const propietarioService = {
	async listar(
		page = 1,
		limit = 10,
	): Promise<PaginatedResponse<PropietarioDto>> {
		const { data } = await api.get<PaginatedResponse<PropietarioDto>>(
			"/propietarios",
			{ params: { page, limit } },
		);
		return data;
	},

	async obtenerDetalle(id: number): Promise<PropietarioDetalleDto> {
		const { data } = await api.get<PropietarioDetalleDto>(
			`/propietarios/${id}`,
		);
		return data;
	},

	async registrar(input: RegistrarPropietarioInput): Promise<PropietarioDto> {
		const formData = new FormData();
		formData.append("nombre", input.nombre);
		if (input.telefono) formData.append("telefono", input.telefono);
		if (input.correo) formData.append("correo", input.correo);
		if (input.imagenMarca) {
			formData.append("imagenMarca", input.imagenMarca);
		}

		const { data } = await api.post<PropietarioDto>("/propietarios", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return data;
	},

	async actualizar(
		id: number,
		input: ActualizarPropietarioInput,
	): Promise<PropietarioDto> {
		const formData = new FormData();
		if (input.nombre !== undefined) formData.append("nombre", input.nombre);
		if (input.telefono !== undefined) {
			formData.append("telefono", input.telefono ?? "");
		}
		if (input.correo !== undefined) {
			formData.append("correo", input.correo ?? "");
		}
		if (input.imagenMarca !== undefined) {
			if (input.imagenMarca instanceof File) {
				formData.append("imagenMarca", input.imagenMarca);
			} else if (input.imagenMarca === null) {
				formData.append("imagenMarca", "null");
			}
		}

		const { data } = await api.put<PropietarioDto>(
			`/propietarios/${id}`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			},
		);
		return data;
	},

	async eliminar(id: number): Promise<void> {
		await api.delete(`/propietarios/${id}`);
	},
};
