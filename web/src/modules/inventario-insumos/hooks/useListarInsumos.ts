import { useQuery } from "@tanstack/react-query";
import { insumoService } from "../services/insumoService";

export interface ListarInsumosParams {
	page?: number;
	limit?: number;
	nombre?: string;
	tipo?: string;
}

export function useListarInsumos(
	paramsOrPage: ListarInsumosParams | number = 1,
	limit = 10,
	nombre?: string,
	tipo?: string,
) {
	const params =
		typeof paramsOrPage === "object"
			? {
					page: paramsOrPage.page ?? 1,
					limit: paramsOrPage.limit ?? 10,
					nombre: paramsOrPage.nombre,
					tipo: paramsOrPage.tipo,
				}
			: { page: paramsOrPage, limit, nombre, tipo };

	return useQuery({
		queryKey: [
			"insumos",
			params.page,
			params.limit,
			params.nombre,
			params.tipo,
		],
		queryFn: () =>
			insumoService.listar(
				params.page,
				params.limit,
				params.nombre,
				params.tipo,
			),
	});
}
