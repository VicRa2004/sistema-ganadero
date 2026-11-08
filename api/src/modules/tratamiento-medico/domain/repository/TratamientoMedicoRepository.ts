import type { Pagination } from "@/core/shared/domain/Pagination";
import type { TratamientoMedico } from "../TratamientoMedico";
import type { TratamientoMedicoFilters } from "./TratamientoMedicoFilters";

export interface TratamientoMedicoRepository {
	save(tratamiento: TratamientoMedico): Promise<TratamientoMedico>;
	findById(id: number): Promise<TratamientoMedico | null>;
	find(
		filters: TratamientoMedicoFilters,
	): Promise<Pagination<TratamientoMedico>>;
	findByGanadoId(ganadoId: number): Promise<TratamientoMedico[]>;
	delete(id: number): Promise<void>;
}
