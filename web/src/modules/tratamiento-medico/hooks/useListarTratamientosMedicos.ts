import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { tratamientoMedicoService } from "../services/tratamientoMedicoService";
import type { TratamientoMedicoFilters } from "../types";

export function useListarTratamientosMedicos(
	filters: TratamientoMedicoFilters,
) {
	return useQuery({
		placeholderData: keepPreviousData,
		queryKey: ["tratamientos-medicos", filters],
		queryFn: () => tratamientoMedicoService.listar(filters),
	});
}
