import { api } from "@/config/axios";
import { descargarArchivoApi } from "@/lib/descargarArchivo";
import type {
	ActualizarGastoInputDto,
	GastoFilters,
	GastoOutputDto,
	GastosPaginated,
	RegistrarCompraInputDto,
	RegistrarGastoInputDto,
	RegistrarVentaInputDto,
	RentabilidadAnimalDto,
	RentabilidadResumenDto,
	TransaccionFilters,
	TransaccionOutputDto,
	TransaccionesPaginated,
} from "../types";

function toComercialBody<T extends { documentoAdjunto?: File | null }>(
	input: T,
) {
	const { documentoAdjunto, ...jsonBody } = input;
	if (!documentoAdjunto) {
		return { body: jsonBody, config: undefined };
	}
	const formData = new FormData();
	formData.append("payload", JSON.stringify(jsonBody));
	formData.append("documentoAdjunto", documentoAdjunto);
	return {
		body: formData,
		config: { headers: { "Content-Type": "multipart/form-data" } },
	};
}

export const comercialService = {
	async listarTransacciones(
		filters: TransaccionFilters = {},
	): Promise<TransaccionesPaginated> {
		const { data } = await api.get<TransaccionesPaginated>(
			"/comercial/transacciones",
			{
				params: {
					page: filters.page ?? 1,
					limit: filters.limit ?? 10,
					tipo: filters.tipo || undefined,
					desde: filters.desde || undefined,
					hasta: filters.hasta || undefined,
				},
			},
		);
		return data;
	},

	async obtenerTransaccion(id: number): Promise<TransaccionOutputDto> {
		const { data } = await api.get<TransaccionOutputDto>(
			`/comercial/transacciones/${id}`,
		);
		return data;
	},

	async exportarTransaccionPdf(id: number): Promise<void> {
		await descargarArchivoApi(
			`/comercial/transacciones/${id}/pdf`,
			`comprobante-transaccion-${id}.pdf`,
		);
	},

	async registrarVenta(
		input: RegistrarVentaInputDto,
	): Promise<TransaccionOutputDto> {
		const { body, config } = toComercialBody(input);
		const { data } = await api.post<TransaccionOutputDto>(
			"/comercial/transacciones/venta",
			body,
			config,
		);
		return data;
	},

	async registrarCompra(
		input: RegistrarCompraInputDto,
	): Promise<TransaccionOutputDto> {
		const { body, config } = toComercialBody(input);
		const { data } = await api.post<TransaccionOutputDto>(
			"/comercial/transacciones/compra",
			body,
			config,
		);
		return data;
	},

	async eliminarTransaccion(id: number): Promise<void> {
		await api.delete(`/comercial/transacciones/${id}`);
	},

	async listarGastos(filters: GastoFilters = {}): Promise<GastosPaginated> {
		const { data } = await api.get<GastosPaginated>("/comercial/gastos", {
			params: {
				page: filters.page ?? 1,
				limit: filters.limit ?? 10,
				categoria: filters.categoria || undefined,
				terrenoId: filters.terrenoId || undefined,
				ganadoId: filters.ganadoId || undefined,
				loteId: filters.loteId || undefined,
				desde: filters.desde || undefined,
				hasta: filters.hasta || undefined,
			},
		});
		return data;
	},

	async registrarGasto(input: RegistrarGastoInputDto): Promise<GastoOutputDto> {
		const { data } = await api.post<GastoOutputDto>("/comercial/gastos", input);
		return data;
	},

	async actualizarGasto(
		id: number,
		input: ActualizarGastoInputDto,
	): Promise<GastoOutputDto> {
		const { data } = await api.put<GastoOutputDto>(
			`/comercial/gastos/${id}`,
			input,
		);
		return data;
	},

	async eliminarGasto(id: number): Promise<void> {
		await api.delete(`/comercial/gastos/${id}`);
	},

	async obtenerRentabilidad(params?: {
		desde?: string;
		hasta?: string;
	}): Promise<RentabilidadResumenDto> {
		const { data } = await api.get<RentabilidadResumenDto>(
			"/comercial/rentabilidad",
			{
				params: {
					desde: params?.desde || undefined,
					hasta: params?.hasta || undefined,
				},
			},
		);
		return data;
	},

	async obtenerRentabilidadGanado(
		ganadoId: number,
	): Promise<RentabilidadAnimalDto> {
		const { data } = await api.get<RentabilidadAnimalDto>(
			`/comercial/rentabilidad/ganado/${ganadoId}`,
		);
		return data;
	},
};
