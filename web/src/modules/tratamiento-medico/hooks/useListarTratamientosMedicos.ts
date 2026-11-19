import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { tratamientoMedicoService } from "../services/tratamientoMedicoService";
import type { TratamientoMedicoFilters } from "../types";

export function useListarTratamientosMedicos(
	filters: TratamientoMedicoFilters,
) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: queryKeys.tratamientosMedicos.list(filters),
		queryFn: () => tratamientoMedicoService.listar(filters),
	});
}
