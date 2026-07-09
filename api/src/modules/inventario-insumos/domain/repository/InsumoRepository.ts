import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Insumo } from "../Insumo";
import type { InsumoFilters } from "./InsumoFilters";

export interface InsumoRepository {
	findById(id: number): Promise<Insumo | null>;
	findAll(filters: InsumoFilters): Promise<Pagination<Insumo>>;
	findCriticos(): Promise<Insumo[]>;
	save(insumo: Insumo): Promise<Insumo>;
	delete(id: number): Promise<void>;
}
