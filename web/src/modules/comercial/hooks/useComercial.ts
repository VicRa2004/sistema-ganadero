import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { comercialService } from "../services/comercialService";
import type {
	ActualizarGastoInputDto,
	GastoFilters,
	RegistrarCompraInputDto,
	RegistrarGastoInputDto,
	RegistrarVentaInputDto,
	TransaccionFilters,
} from "../types";

export function useListarTransacciones(filters: TransaccionFilters = {}) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: queryKeys.comercial.transacciones(filters),
		queryFn: () => comercialService.listarTransacciones(filters),
	});
}

export function useObtenerTransaccion(id: number | null) {
	return useQuery({
		queryKey: queryKeys.comercial.transaccionDetail(id ?? 0),
		queryFn: () => comercialService.obtenerTransaccion(id ?? 0),
		enabled: Boolean(id && id > 0),
	});
}

export function useRegistrarVenta() {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Venta registrada correctamente" },
		mutationFn: (input: RegistrarVentaInputDto) =>
			comercialService.registrarVenta(input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.comercial.transaccionesAll(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.comercial.rentabilidadAll(),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.ganado.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.terrenos.all });
			queryClient.invalidateQueries({
				queryKey: queryKeys.dashboard.resumen(),
			});
		},
	});
}

export function useRegistrarCompra() {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Compra de ganado registrada correctamente" },
		mutationFn: (input: RegistrarCompraInputDto) =>
			comercialService.registrarCompra(input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.comercial.transaccionesAll(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.comercial.rentabilidadAll(),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.ganado.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.terrenos.all });
			queryClient.invalidateQueries({
				queryKey: queryKeys.dashboard.resumen(),
			});
		},
	});
}

export function useEliminarTransaccion() {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Transacción eliminada" },
		mutationFn: (id: number) => comercialService.eliminarTransaccion(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.comercial.transaccionesAll(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.comercial.rentabilidadAll(),
			});
		},
	});
}

export function useListarGastos(filters: GastoFilters = {}) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: queryKeys.comercial.gastos(filters),
		queryFn: () => comercialService.listarGastos(filters),
	});
}

export function useRegistrarGasto() {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Gasto registrado correctamente" },
		mutationFn: (input: RegistrarGastoInputDto) =>
			comercialService.registrarGasto(input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.comercial.gastosAll(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.comercial.rentabilidadAll(),
			});
		},
	});
}

export function useActualizarGasto() {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Gasto actualizado" },
		mutationFn: ({
			id,
			input,
		}: {
			id: number;
			input: ActualizarGastoInputDto;
		}) => comercialService.actualizarGasto(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.comercial.gastosAll(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.comercial.rentabilidadAll(),
			});
		},
	});
}

export function useEliminarGasto() {
	const queryClient = useQueryClient();
	return useMutation({
		meta: { successMessage: "Gasto eliminado" },
		mutationFn: (id: number) => comercialService.eliminarGasto(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.comercial.gastosAll(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.comercial.rentabilidadAll(),
			});
		},
	});
}

export function useObtenerRentabilidad(params?: {
	desde?: string;
	hasta?: string;
}) {
	return useQuery({
		queryKey: queryKeys.comercial.rentabilidad(params),
		queryFn: () => comercialService.obtenerRentabilidad(params),
	});
}

export function useRentabilidadGanado(ganadoId: number, enabled = true) {
	return useQuery({
		queryKey: queryKeys.comercial.rentabilidadGanado(ganadoId),
		queryFn: () => comercialService.obtenerRentabilidadGanado(ganadoId),
		enabled: enabled && ganadoId > 0,
	});
}
