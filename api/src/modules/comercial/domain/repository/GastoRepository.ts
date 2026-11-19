import type { Pagination } from "@/core/shared/domain/Pagination";
import type { Gasto } from "../Gasto";
import type { GastoFilters } from "./ComercialFilters";

export interface GastoRepository {
	save(gasto: Gasto): Promise<Gasto>;
	findById(id: number): Promise<Gasto | null>;
	findAll(filters: GastoFilters): Promise<Pagination<Gasto>>;
	delete(id: number): Promise<void>;
}
